//all express routes should be defined in this file. This file is the entry point for the express application. All routes should be defined in this file and then imported into the server.ts file.

import express from "express";
import healthRouter from "./routes/health.routes";
import { requestLogger } from "./middlewares/request-logger.middleware";

const app = express();
app.use(requestLogger);//we want it for all incomng requests , even for routes that doesnt match
app.use(express.json());
app.use("/api/v1/health", healthRouter);

export default app;
