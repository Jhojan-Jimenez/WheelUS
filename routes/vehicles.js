import { Router } from 'express';
import vehicleController from '../controllers/vehicles.js';
import { uploadVehicle } from '../middlewares/uploadImages.js';
import { verifyVehiclePlate } from '../middlewares/existsDocuments.js';
const vehicleRouter = Router();

vehicleRouter.get('/', vehicleController.getVehicles);
vehicleRouter.post('/', uploadVehicle, vehicleController.postVehicle);
vehicleRouter.get(
  '/:plate',
  verifyVehiclePlate,
  vehicleController.getVehicleByPlate
);
vehicleRouter.patch(
  '/:plate',
  verifyVehiclePlate,
  uploadVehicle,
  vehicleController.patchVehicle
);
vehicleRouter.delete(
  '/:plate',
  verifyVehiclePlate,
  vehicleController.deleteVehicle
);
vehicleRouter.get(
  '/:plate/rides',
  verifyVehiclePlate,
  vehicleController.getVehicleRides
);

export default vehicleRouter;
