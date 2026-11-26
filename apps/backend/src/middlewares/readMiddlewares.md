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




flowchart TD
    A[Incoming Request] --> B[Request Logger]
    B --> C[JSON Parser]
    C --> D{Matching Route?}
    D -->|Yes| E[Route Handler]
    D -->|No| F[404 Middleware]
    E --> G{Error occurred?}
    G -->|No| H[Response]
    G -->|Yes| I[Error Middleware]
    F --> H
    I --> J[Error Response]
