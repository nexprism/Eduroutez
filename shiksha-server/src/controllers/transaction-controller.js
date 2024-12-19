import { StatusCodes } from "http-status-codes";
import TransactionService from "../services/transaction-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const transactionService = new TransactionService();

/**
 * POST : /transaction
 * req.body {}
 */
export const createTransaction = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.image = req.file.filename;

      const response = await transactionService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a transaction";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /transaction
 * req.body {}
 */

export async function getTransactions(req, res) {
  try {
    const response = await transactionService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched transactions";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating transaction:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /transaction/:id
 * req.body {}
 */

export async function getTransaction(req, res) {
  try {
    const response = await transactionService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the transaction";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /transaction/:id
 * req.body {capacity:200}
 */

export async function updateTransaction(req, res) {
  try {
    const couponId = req.params.id;
    const payload = {};

    // Check if a new title is provided
    if (req.body.title) {
      payload.title = req.body.title;
    }

    // Update the transaction with new data
    const response = await transactionService.update(couponId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the transaction";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update transaction error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /transaction/:id
 * req.body {}
 */

export async function deleteTransaction(req, res) {
  try {
    const response = await transactionService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the transaction";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
