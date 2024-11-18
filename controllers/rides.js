import { validationErrors } from '../errors/CustomErrors.js';
import { rideSchema } from '../lib/validators.js';
import ridesModel from '../models/rides.js';

class rideController {
  static async getRides(req, res, next) {
    const allowedQueryParams = ['origin', 'destination', 'seats'];
    try {
      const queryParams = req.body;
      const queryParamsKeys = Object.keys(queryParams);
      const isValid = queryParamsKeys.every((param) =>
        allowedQueryParams.includes(param)
      );

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid query parameters' });
      }
      const rides = await ridesModel.getAllRides(queryParams);

      res.status(200).json({ rides: rides });
    } catch (error) {
      next(error);
    }
  }
  static async postRide(req, res, next) {
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
      } else if (error.message === 'NotEnoughSeats') {
        return res
          .status(409)
          .json({ message: 'No tienes suficientes asientos en tu carro' });
      }

      next(error);
    }
  }
  static async getRide(req, res) {
    res.status(200).json({
      ride: req.ride,
    });
  }
  static async deleteRide(req, res, next) {
    try {
      const { id } = req.params;
      await ridesModel.deleteRide(id);
      res.status(200).json({
        message: 'Ride eliminado correctamente',
      });
    } catch (error) {
      if (error.message === 'RideHaveActivePassengers') {
        return res.status(409).json({
          message:
            'El ride no puede eliminarse con menos de 30 minutos de antelación ',
        });
      }
      next(error);
    }
  }
  static async recommendedFee(req, res, next) {
    try {
      const { startPoint, endPoint } = req.query;
      const fee = await ridesModel.getRecommendedFee(startPoint, endPoint);
      res.status(200).json({ recommendedFee: fee });
    } catch (error) {
      next(error);
    }
  }
  static async startRoutes(req, res, next) {
    try {
      const origins = await ridesModel.getStartingPoints();
      res.status(200).json({
        origins: origins,
      });
    } catch (error) {
      next(error);
    }
  }
  static async endRoutes(req, res, next) {
    try {
      const destinations = await ridesModel.getEndingPoints();
      res.status(200).json({
        destinations: destinations,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default rideController;
