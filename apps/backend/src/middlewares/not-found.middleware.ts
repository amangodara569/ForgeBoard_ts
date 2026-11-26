//404 middleware
import type { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (_req, res) =>
    res.status(404).json({
        success: false,
        error: {
            code : "404_REQUEST_NOT_FOUND",
            message: `Cannot find ${_req.originalUrl} on this server`,
        }
    })