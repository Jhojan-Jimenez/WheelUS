import { formatZodErrors, rideSchema } from '../lib/validators.js';
import ridesModel from '../models/rides.js';

class rideController {
  static async getRides(req, res) {
    try {
      const rides = await ridesModel.getAllRides();
      res.status(200).json({ rides: rides });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  static async postRide(req, res) {
    try {
      const rideData = req.body;
      const validData = rideSchema.safeParse(rideData);
      if (!validData.success) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validData.error.format(),
        });
      }
      const rideId = await ridesModel.createRide(rideData);
      res.status(200).json({
        message: 'Ride correctly created',
        ride: { rideId: rideId, ...rideData },
      });
    } catch (error) {
      console.log(error);
      if (error.message === 'This vehicle plate does not exists') {
        return res
          .status(400)
          .json({ message: 'This vehicle plate does not exists' });
      }

      return res.status(500).json({ message: error.message });
    }
  }
  static async getRide() {
    const { id } = req.params;
  }
  static async patchRide() {
    const { id } = req.params;
  }
  static async deleteRide() {
    const { id } = req.params;
  }
  static async recommendedFee() {
    const { startPoint, endPoint } = req.query;
  }
  static async startRoutes() {}
  static async endRoutes() {}
}

export default rideController;
