import { QuestionAnswerRepository } from "../repository/question-answer-repository.js";
import { UserRepository } from "../repository/user-repository.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class questionAnswerService {
  constructor() {
    this.questionAnswerRepository = new QuestionAnswerRepository();
    this.userRepository = new UserRepository();
  }

  async create(data) {
    try {
      const questionAnswer = await this.questionAnswerRepository.create(data);
      return questionAnswer;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        if (Array.isArray(value)) {
          const regexPattern = value.join('|');
          filterConditions.$and = filterConditions.$and || [];
          filterConditions.$and.push({ [key]: { $regex: regexPattern, $options: 'i' } });
        } else {
          filterConditions[key] = value;
        }
      }

      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      if (query.user === "true" || query.user === true) {
        filterConditions.$and = filterConditions.$and || [];
        filterConditions.$and.push({ $or: [{ answer: { $ne: null } }, { 'answers.0': { $exists: true } }] });
      }

      const questionAnswers = await this.questionAnswerRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      if (questionAnswers && Array.isArray(questionAnswers.result)) {
        const resultsWithNames = await Promise.all(
          questionAnswers.result.map(async (qa) => {
            try {
              const askedByEmail = qa.askedBy;
              let askedByObj = null;
              if (askedByEmail) {
                const user = await this.userRepository.get(askedByEmail);
                askedByObj = {
                  email: askedByEmail,
                  name: user && user.name ? user.name : null,
                };
              }

              let answeredByObj = null;
              if (qa.answeredBy) {
                try {
                  const answeredUser = await this.userRepository.get(qa.answeredBy);
                  answeredByObj = {
                    email: qa.answeredBy,
                    name: answeredUser && answeredUser.name ? answeredUser.name : null,
                  };
                } catch (err) {
                  answeredByObj = null;
                }
              }

              let enrichedAnswers = qa.answers;
              if (Array.isArray(qa.answers) && qa.answers.length > 0) {
                enrichedAnswers = await Promise.all(
                  qa.answers.map(async (ans) => {
                    try {
                      if (!ans || !ans.answeredBy) return ans;
                      const userAns = await this.userRepository.get(ans.answeredBy);
                      const upvotes = ans.likes ? ans.likes.filter(l => l.type === 'upvote').length : 0;
                      const downvotes = ans.likes ? ans.likes.filter(l => l.type === 'downvote').length : 0;
                      return {
                        ...ans.toObject ? ans.toObject() : ans,
                        answeredBy: {
                          email: ans.answeredBy,
                          name: userAns && userAns.name ? userAns.name : null,
                        },
                        voteScore: upvotes - downvotes,
                      };
                    } catch (err) {
                      return ans;
                    }
                  })
                );
                enrichedAnswers.sort((a, b) => (b.voteScore || 0) - (a.voteScore || 0));
              }

              const questionUpvotes = qa.questionLikes ? qa.questionLikes.filter(l => l.type === 'upvote').length : 0;
              const questionDownvotes = qa.questionLikes ? qa.questionLikes.filter(l => l.type === 'downvote').length : 0;

              return {
                ...qa.toObject ? qa.toObject() : qa,
                askedBy: askedByObj || qa.askedBy,
                answeredBy: answeredByObj || qa.answeredBy,
                answers: enrichedAnswers,
                voteScore: questionUpvotes - questionDownvotes,
              };
            } catch (err) {
              return qa;
            }
          })
        );

        questionAnswers.result = resultsWithNames;
      }

      return questionAnswers;
    } catch (error) {
      console.log('error on course', error.message);
      throw new AppError("Cannot fetch data of all the questionAnswers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const questionAnswer = await this.questionAnswerRepository.getQuestion(id);
    return questionAnswer;
  }

  async getbyEmail(email) {
    try {
      const questionAnswers = await this.questionAnswerRepository.getbyInstituteEmail(email);
      if (Array.isArray(questionAnswers)) {
        questionAnswers.forEach(qa => {
          if (Array.isArray(qa.answers) && qa.answers.length > 0) {
            const enriched = qa.answers.map(ans => {
              const upvotes = ans.likes ? ans.likes.filter(l => l.type === 'upvote').length : 0;
              const downvotes = ans.likes ? ans.likes.filter(l => l.type === 'downvote').length : 0;
              return { ans, voteScore: upvotes - downvotes };
            });
            enriched.sort((a, b) => b.voteScore - a.voteScore);
            qa.answers = enriched.map(e => e.ans);
          }
        });
      }
      return questionAnswers;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const existing = await this.questionAnswerRepository.getQuestion(id);
      if (!existing) {
        throw new AppError("Question not found", StatusCodes.NOT_FOUND);
      }

      if (data.answeredBy) {
        const alreadyAnswered = await this.questionAnswerRepository.hasExistingAnswer(id, data.answeredBy);
        if (alreadyAnswered) {
          throw new AppError("You have already answered this question", StatusCodes.BAD_REQUEST);
        }
      }

      const questionAnswer = await this.questionAnswerRepository.submitAnswer(id, data);

      const existingUser = await this.userRepository.get(data.answeredBy);
      if (!existingUser) {
        throw new AppError("Email doesn't exists", StatusCodes.NOT_FOUND);
      }

      const userPayload = { points: existingUser.points + 50 };
      let level;
      let commission;

      if (userPayload.points <= 500) {
        level = "Career Advisor";
        commission = "30";
      } else if (userPayload.points <= 2000) {
        level = "Senior Career Advisor";
        commission = "35";
      } else if (userPayload.points <= 5000) {
        level = "Career Consultant";
        commission = "40";
      } else if (userPayload.points <= 10000) {
        level = "Career Consultant Specialist";
        commission = "45";
      } else if (userPayload.points <= 50000) {
        level = "Lead Career Consultant";
        commission = "50";
      }

      userPayload.level = level;
      userPayload.commission = commission;
      await this.userRepository.update(existingUser.id, userPayload);

      return questionAnswer;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Cannot update the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMetadata(id, data) {
    try {
      const questionAnswer = await this.questionAnswerRepository.update(id, data);
      return questionAnswer;
    } catch (error) {
      throw new AppError("Cannot update the question", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const questionAnswer = await this.questionAnswerRepository.destroy(id);
      return questionAnswer;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The questionAnswer you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async likeQuestion(questionId, userId, type) {
    try {
      const result = await this.questionAnswerRepository.likeQuestion(questionId, userId, type);
      return result;
    } catch (error) {
      throw new AppError("Cannot like the question", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async likeAnswer(questionId, answerId, userId, type, answeredBy) {
    try {
      const result = await this.questionAnswerRepository.likeAnswer(questionId, answerId, userId, type, answeredBy);
      return result;
    } catch (error) {
      throw new AppError("Cannot like the answer", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async editAnswer(questionId, userId, newAnswer) {
    try {
      const doc = await this.questionAnswerRepository.getQuestion(questionId);
      if (!doc) throw new AppError("Question not found", StatusCodes.NOT_FOUND);

      const answer = doc.answers.find(a => a.answeredBy === userId);
      if (!answer) throw new AppError("Answer not found", StatusCodes.NOT_FOUND);

      const result = await this.questionAnswerRepository.editAnswer(questionId, userId, newAnswer);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Cannot edit the answer", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default questionAnswerService;
