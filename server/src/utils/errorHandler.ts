import { Request, Response, NextFunction } from "express";

/**
 * Custom error interface extending the standard Error object
 * @interface AppError
 * @extends Error
 * @property {number} [statusCode] - HTTP status code for the error
 * @property {boolean} [isOperational] - Flag indicating if error is operational (expected) vs programming error
 */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware for Express
 * Catches all errors thrown in the application and formats a consistent error response
 *
 * @param {AppError} error - The error object to handle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {void}
 *
 * @example
 * app.use(errorHandler);
 */
export const errorHandler = (error: AppError, req: Request, res: Response): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

/**
 * Creates a custom error object with HTTP status code
 *
 * @param {string} message - Error message to display
 * @param {number} [statusCode=500] - HTTP status code (default: 500)
 * @returns {AppError} Custom error object with statusCode and isOperational flag
 *
 * @example
 * throw createError("User not found", 404);
 * throw createError("Invalid input", 400);
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Wraps async route handlers to catch errors and pass them to error middleware
 * Eliminates the need for try-catch blocks in every async route handler
 *
 * @param {Function} fn - Async function to wrap (typically an Express route handler)
 * @returns {Function} Wrapped function that catches errors and passes them to next()
 *
 * @example
 * router.get("/users", asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: Function): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
