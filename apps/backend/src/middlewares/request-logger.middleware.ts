import type { Request , Response, NextFunction } from "express";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const starTime = Date.now();

    res.on("finish", ()=>{
        const duration = Date.now() - starTime;

        console.log(`${req.method} ${ req.originalUrl } ${res.statusCode} - ${duration}ms`);
    });

    next();
}

//res.on("finish") = register a listener for response finish event
// Why do we need it?
// Because we want to log the final response status after the response has been sent, not before.