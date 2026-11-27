// ==defines how requests are processed before they reach the route handlers

import { Router } from "express"

//example 
//GET /api/v1/issues , we get a request at this route

// Before this request reaches the route handler, we might want to:
// - Check whether the user is authenticated.
// - Check whether they have permission.
// - Log the incoming request.
// - Parse the request body.
// - Validate incoming data.
// - Handle errors.


//flow

// Incoming HTTP Request
//        |
// Request Logger Middleware
//        |    
// Authentication Middleware
//        |    
// Validation Middleware
//        |    
// Express Router
//        |    
// Controller
//        |    
// HTTP Response

// Each middleware can:
// 1. Execute some logic.
// 2. Modify the request or response.
// 3. Pass control to the next middleware using next().
// 4. End the request by sending a response.
// 5. Pass an error to Express using next(error).


// Parameter	Meaning
// req	=Incoming HTTP request
// res	=HTTP response we send back
// next	=Function that passes control forward


//custom middleware 
// Whenever someone accesses ForgeBoard, we'll log:
// - HTTP method
// - Requested URL
// - Response status code
// - Request processing duration




//typescript type middlewares
They tell TypeScript what kind of function we're creating and what parameters that function receives.


req.body – Request body.
req.params – URL parameters.
req.query – Query parameters.
req.headers – HTTP headers.
req.method – HTTP method.
req.url – Requested URL.


//response
res.status(200);
res.json({ message: "Success" });
res.send("Hello");
res.cookie("token", "abc");

 RequestHandler
This is particularly useful.

Instead of defining the types of req, res and next individually, Express provides a predefined type called RequestHandler.


ErrorRequestHandler
This is specifically for error-handling middleware.