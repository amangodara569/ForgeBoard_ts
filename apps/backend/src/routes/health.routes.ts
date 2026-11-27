import { Router } from "express";
import { healthCheck } from "../controllers/health.controllers";
const router = Router();
//its like we create all our health routes here and then we will import this router into the app.ts file and then we will use this router in the app.ts file.
// router.get("/", (_req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "API running",
//     });
// });

router.get("/", healthCheck);  



//after introducing controllers we will move the logic of the above route to a controller and then we will import that controller here and then we will use that controller in the route handler.
//internally all paths are defined here like / , /id and all and 
// all are exported to app.ts and mounted at /api/v1/health and 
// then the app.ts is imported into the server.ts and the server.ts is run and
//  the server.ts is listening on the port specified in the environment variable PORT or default to 3000  
export default router;
