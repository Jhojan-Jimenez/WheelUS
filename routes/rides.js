import { Router } from 'express';
import rideController from '../controllers/rides.js';
import { verifyRideID } from '../middlewares/existsDocuments.js';
const rideRouter = Router();

rideRouter.post('/', rideController.postRide);
rideRouter.post('/get-rides', rideController.getRides);
rideRouter.get('/fee', rideController.recommendedFee);
rideRouter.get('/start-routes', rideController.startRoutes);
rideRouter.get('/end-routes', rideController.endRoutes);
rideRouter.get('/:id', verifyRideID, rideController.getRide);
rideRouter.delete('/:id', verifyRideID, rideController.deleteRide);

export default rideRouter;
