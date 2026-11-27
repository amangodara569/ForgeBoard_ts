import type { ErrorRequestHandler } from "express";
//this middleware is used to handle errors that occur during the request processing. It captures the error, determines the appropriate status code and message, and sends a JSON response back to the client. If the response headers have already been sent, it passes the error to the next middleware in the chain.
export const ErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    next,
) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode =
        typeof err?.statusCode === "number" ? err.statusCode : 500;
    let message = "request failed";

    if (statusCode >= 500) {
        message = "internal server error";
    } else if (err instanceof Error) {
        message = err.message;
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            message,
        },
    });
};