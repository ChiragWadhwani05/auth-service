import mongoose from "mongoose";
import process from "node:process";
import { ApiError } from "../utils/apiError.js";

/**
 *
 * @type {import("express").ErrorRequestHandler}
 *
 * @description This middleware is responsible to catch the errors from any request handler.
 *
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  let error = err;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
    // if not
    // create a new ApiError instance to keep the consistency

    // assign an appropriate status code
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    // set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  // Send error response
  res.status(error.statusCode).json(response);
  return next();
}

export { errorHandler };