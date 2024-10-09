import { Router } from "express";
import rideController from "../controllers/rides.js";
const rideRouter = Router();

rideRouter.get("/", rideController.getRides);

export default rideRouter;
