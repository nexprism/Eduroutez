import QuestionAnswer from "../models/QuestionAnswer.js";
import CrudRepository from "./crud-repository.js";

class QuestionAnswerRepository extends CrudRepository {
  constructor() {
    super(QuestionAnswer);
  }

  async getbyInstituteEmail(email) {
    try {
      const docs = await this.model.find({ instituteEmail: email });
      if (docs && docs.length > 0) {
        await Promise.all(docs.map(doc => {
          if (doc.answers && doc.answers.length > 0) {
            return doc.save({ validateBeforeSave: false });
          }
          return doc;
        }));
      }
      return docs;
    } catch (error) {
      throw error;
    }
  }

  async submitAnswer(id, data) {
    try {
      const answer = {
        answer: data.answer,
        answeredBy: data.answeredBy,
        answeredAt: new Date(),
      };
      const result = await this.model
        .findByIdAndUpdate(id, { $push: { answers: answer } }, { new: true });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getQuestion(id) {
    try {
      const doc = await this.model.findById(id);
      if (doc) {
        await doc.save({ validateBeforeSave: false });
      }
      return doc;
    } catch (error) {
      throw error;
    }
  }

  async hasExistingAnswer(questionId, answeredBy) {
    try {
      const result = await this.model.findOne({
        _id: questionId,
        "answers.answeredBy": answeredBy,
      });
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  async likeQuestion(questionId, userId, type) {
    try {
      const doc = await this.model.findById(questionId);
      if (!doc) throw new Error("Question not found");

      const existingIndex = doc.questionLikes.findIndex(
        (l) => l.userId.toString() === userId.toString()
      );

      if (existingIndex > -1) {
        if (doc.questionLikes[existingIndex].type === type) {
          doc.questionLikes.splice(existingIndex, 1);
        } else {
          doc.questionLikes[existingIndex].type = type;
        }
      } else {
        doc.questionLikes.push({ userId, type });
      }

      return await doc.save();
    } catch (error) {
      throw error;
    }
  }

  async likeAnswer(questionId, answerId, userId, type, answeredBy) {
    try {
      const doc = await this.model.findById(questionId);
      if (!doc) throw new Error("Question not found");

      let answer = doc.answers.find(a => a._id && a._id.toString() === answerId.toString());
      if (!answer && answeredBy) {
        answer = doc.answers.find(a => a.answeredBy && a.answeredBy.toString() === answeredBy.toString());
      }
      if (!answer) throw new Error("Answer not found");

      const existingIndex = answer.likes.findIndex(
        (l) => l.userId.toString() === userId.toString()
      );

      if (existingIndex > -1) {
        if (answer.likes[existingIndex].type === type) {
          answer.likes.splice(existingIndex, 1);
        } else {
          answer.likes[existingIndex].type = type;
        }
      } else {
        answer.likes.push({ userId, type });
      }

      return await doc.save();
    } catch (error) {
      throw error;
    }
  }

  async editAnswer(questionId, answeredBy, newAnswer) {
    try {
      const doc = await this.model.findById(questionId);
      if (!doc) throw new Error("Question not found");

      const answer = doc.answers.find(a => a.answeredBy === answeredBy);
      if (!answer) throw new Error("Answer not found");

      answer.answer = newAnswer;
      answer.editedAt = new Date();
      answer.isEdited = true;

      return await doc.save();
    } catch (error) {
      throw error;
    }
  }

  async getByUserId(userId, status) {
    try {
      const docs = await this.model.find({ userId, status, deletedAt: null }).sort({ createdAt: -1 });
      return docs;
    } catch (error) {
      throw error;
    }
  }

  async replyToAnswer(questionId, answerId, replyData) {
    try {
      const doc = await this.model.findById(questionId);
      if (!doc) throw new Error("Question not found");

      const answer = doc.answers.id(answerId);
      if (!answer) throw new Error("Answer not found");

      answer.replies.push(replyData);
      return await doc.save();
    } catch (error) {
      throw error;
    }
  }
}

export { QuestionAnswerRepository };
