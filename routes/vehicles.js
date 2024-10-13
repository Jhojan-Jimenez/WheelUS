import { Router } from "express";
import vehicleController from "../controllers/vehicles.js";
const vehicleRouter = Router();

vehicleRouter.get("/", vehicleController.getVehicles);
vehicleRouter.post("/", vehicleController.postVehicle);
vehicleRouter.get("/:plate", vehicleController.getVehicleByPlate);
vehicleRouter.patch("/:plate", vehicleController.patchVehicle);
vehicleRouter.delete("/:plate", vehicleController.deleteVehicle);

export default vehicleRouter;
