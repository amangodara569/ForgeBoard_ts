//flow
//node js starts -server.ts -> create express app ->configure middleware ->register routes -> starts http server ->listen to port -> recieve incoming requests -> process requests -> send response back to client

import express from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT  > 65535) { //if port is not A NUMBER AND PORT <1 ND PORT >SPECIFIED NO , THROW ERROR
    throw new Error("PORT must be an integer between 1 and 65535");
}

//middleware (PARSE incoming json request, it makes json data accessible through req.body)
app.use(express.json());

//health check route
app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API running",
    });
});



//this starts the http server and makes incoming request listen on secified port
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});