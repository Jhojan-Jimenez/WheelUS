import { Router } from "express";
import vehicleController from "../controllers/vehicles.js";
const vehicleRouter = Router();

vehicleRouter.get("/", vehicleController.getVehicles);

export default vehicleRouter;
