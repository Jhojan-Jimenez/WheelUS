import { validationErrors } from '../errors/CustomErrors.js';
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
      const isValid = validationErrors(validData, res);
      if (isValid !== true) return;
      const rideId = await ridesModel.createRide(rideData);
      res.status(200).json({
        message: 'Ride creado correctamente',
        ride: { rideId: rideId, ...rideData },
      });
    } catch (error) {
      if (error.message === 'VehicleNotFound') {
        return res
          .status(400)
          .json({ message: 'No existe un vehiculo con esa placa' });
      }

      return res.status(500).json({ message: error.message });
    }
  }
  static async getRide() {
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
