import { Router } from 'express';
import rideController from '../controllers/rides.js';
const rideRouter = Router();

rideRouter.get('/', rideController.getRides);
rideRouter.post('/', rideController.postRide);
rideRouter.get('/:id', rideController.getRide);
rideRouter.delete('/:id', rideController.deleteRide);
rideRouter.get('/fee', rideController.recommendedFee);
rideRouter.get('/start-routes', rideController.startRoutes);
rideRouter.get('/end-routes', rideController.endRoutes);

export default rideRouter;
