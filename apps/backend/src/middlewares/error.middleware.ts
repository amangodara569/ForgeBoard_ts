import type { ErrorRequestHandler } from "express";

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