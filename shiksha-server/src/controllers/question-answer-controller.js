import { StatusCodes } from "http-status-codes";
import QuestionAnswerService from "../services/question-answer-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const questionAnswerService = new QuestionAnswerService();

export const createQuestionAnswer = async (req, res) => {
  try {
    const payload = req.body;
    const response = await questionAnswerService.create(payload);
    console.log(response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a question and answer";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating question and answer:", error);
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

export async function getQuestionAnswers(req, res) {
  try {
    const response = await questionAnswerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function getQuestionAnswer(req, res) {
  try {
    console.log(req.params);
    const response = await questionAnswerService.get(req.params.id);
    console.log('hi',response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function getQuestionAnswerByEmail(req, res) {
  try {
    console.log(req.params);
    const response = await questionAnswerService.getbyEmail(req.params.email);
    console.log('hi',response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error.message);

    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function updateQuestionAnswer(req, res) {
  try {
    const questionAnswerId = req.params.id;

    if (req.body.answer && req.body.answeredBy) {
      const response = await questionAnswerService.update(questionAnswerId, {
        answer: req.body.answer,
        answeredBy: req.body.answeredBy,
      });
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully submitted answer";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    }

    const payload = {};
    if (req.body.question) payload.question = req.body.question;
    if (req.body.grade) payload.grade = req.body.grade;
    if (req.body.label) payload.label = req.body.label;

    const response = await questionAnswerService.updateMetadata(questionAnswerId, payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the question";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update question and answer error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

export async function deleteQuestionAnswer(req, res) {
  try {
    const response = await questionAnswerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function submitAnswer(req, res) {
  try {
    const questionId = req.params.id;
    const payload = {
      answer: req.body.answer,
      answeredBy: req.body.answeredBy,
    };

    if (!payload.answer || !payload.answeredBy) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "Answer and answeredBy are required" },
      });
    }

    const response = await questionAnswerService.update(questionId, payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully submitted answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Submit answer error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

export async function likeQuestionAnswer(req, res) {
  try {
    const questionId = req.params.id;
    const { type } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!type || !["upvote", "downvote"].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "Type must be 'upvote' or 'downvote'" },
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "UserId is required" },
      });
    }

    const response = await questionAnswerService.likeQuestion(questionId, userId, type);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated question like";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Like question error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

export async function likeAnswer(req, res) {
  try {
    const questionId = req.params.id;
    const answerId = req.params.answerId;
    const { type, answeredBy } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!type || !["upvote", "downvote"].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "Type must be 'upvote' or 'downvote'" },
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "UserId is required" },
      });
    }

    const response = await questionAnswerService.likeAnswer(questionId, answerId, userId, type, answeredBy);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated answer like";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Like answer error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

export async function editAnswer(req, res) {
  try {
    const questionId = req.params.id;
    const answerId = req.params.answerId;
    const { answer: newAnswer } = req.body;
    const userId = req.body.answeredBy;

    if (!newAnswer) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "Answer text is required" },
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...ErrorResponse,
        error: { message: "answeredBy is required" },
      });
    }

    const response = await questionAnswerService.editAnswer(questionId, userId, newAnswer);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully edited answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Edit answer error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}
