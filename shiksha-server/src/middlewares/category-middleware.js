import { StatusCodes } from "http-status-codes";
import { ErrorResponse } from "../utils/common/index.js";

export function validateCreateRequest(req, res, next) {
  if (!req.body.flightNumber) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "flightNumber not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.airplaneId) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "airplaneId not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.departureAirportId) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "departureAirportId not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.arrivalAirportId) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "arrivalAirportId not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.arrivalTime) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "arrivalTime not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.departureTime) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "departureTime not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.price) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "price not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  if (!req.body.totalSeats) {
    ErrorResponse.message = "Something went wrong while creating flight.";
    ErrorResponse.error = {
      explanation: "totalSeats not found in the incoming request.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  next();
}

export function validateGetAllRequest(req, res, next) {
  const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
  const searchFields = req.query.searchFields ? JSON.parse(req.query.searchFields) : {};
  const sort = req.query.sort ? JSON.parse(req.query.sort) : {};
  const page = req.query.page;
  const limit = req.query.limit;

  // Validate `filters` - allows only `status`
  if (filters && Object.keys(filters).length > 0) {
    const allowedFilterKeys = [];
    const invalidFilterKeys = Object.keys(filters).filter((key) => !allowedFilterKeys.includes(key));
    if (invalidFilterKeys.length > 0) {
      ErrorResponse.message = "Invalid filters in the request.";
      ErrorResponse.error = {
        explanation: allowedFilterKeys.length > 0 ? `Only '${allowedFilterKeys.join(", ")}' are allowed in filters.` : "No filters are allowed.",
      };
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
  }

  // Validate `searchFields` - allows only `title`
  if (searchFields && Object.keys(searchFields).length > 0) {
    const allowedSearchKeys = ["title"];
    const invalidSearchKeys = Object.keys(searchFields).filter((key) => !allowedSearchKeys.includes(key));
    if (invalidSearchKeys.length > 0) {
      ErrorResponse.message = "Invalid searchFields in the request.";
      ErrorResponse.error = {
        explanation:
          allowedSearchKeys.length > 0 ? `Only '${allowedSearchKeys.join(", ")}' are allowed in searchFields. Invalid keys: ${invalidSearchKeys.join(", ")}` : "No searchFields are allowed.",
      };
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
  }

  // Validate `sort` - allows only `createdAt`
  if (sort && Object.keys(sort).length > 0) {
    const allowedSortKeys = ["createdAt"];
    const invalidSortKeys = Object.keys(sort).filter((key) => !allowedSortKeys.includes(key));
    if (invalidSortKeys.length > 0) {
      ErrorResponse.message = "Invalid sort fields in the request.";
      ErrorResponse.error = {
        explanation: allowedSortKeys.length > 0 ? `Only '${allowedSortKeys.join(", ")}' are allowed in sort. Invalid keys: ${invalidSortKeys.join(", ")}` : "No sort fields are allowed.",
      };
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
  }

  // Validate `page` - must be a positive integer
  if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
    ErrorResponse.message = "Invalid page value in the request.";
    ErrorResponse.error = {
      explanation: "Page must be a positive integer.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  // Validate `limit` - must be a positive integer
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0)) {
    ErrorResponse.message = "Invalid limit value in the request.";
    ErrorResponse.error = {
      explanation: "Limit must be a positive integer.",
    };
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  next();
}
