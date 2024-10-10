import { Router } from "express";
import rideController from "../controllers/rides.js";
const rideRouter = Router();

rideRouter.get("/", rideController.getRides);
rideRouter.post("/", rideController.postRide);

export default rideRouter;
