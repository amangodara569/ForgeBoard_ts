//how we split the code into multiple files and import them into server.ts
//we import the app from app.ts and listen on the port specified in the environment variable PORT or default to 3000
//we also check if the PORT is a valid integer between 1 and 65535, if not we throw an error
//we also log the port number to the console when the server starts listening
//


import app from "./app";

const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}

app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});