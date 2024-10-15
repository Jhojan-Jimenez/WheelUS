import { UserNotFoundError } from '../errors/CustomErrors.js';
import ridesModel from '../models/rides.js';
import usersModel from '../models/users.js';
import vehiclesModel from '../models/vehicles.js';

export async function verifyVehiclePlate(req, res, next) {
  const { plate } = req.params;

  try {
    const vehicle = await vehiclesModel.getVehicleByPlate(plate);
    req.vehicle = vehicle;
    next();
  } catch (error) {
    if (error.message === 'VehicleNotFound') {
      return res
        .status(404)
        .json({ message: 'No existe un vehiculo con esa placa' });
    }
    next(error)
  }
}
export async function verifyRideID(req, res, next) {
  const { id } = req.params;
  try {
    const ride = await ridesModel.getRideById(id);
    req.ride = ride;
    next();
  } catch (error) {
    if (error.message === 'RideNotFound') {
      return res.status(404).json({ message: 'No existe un ride con ese ID' });
    }
    next(error)
  }
}
export async function verifyUserID(req, res, next) {
  const { id } = req.params;

  try {
    const user = await usersModel.getUserById(id);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return res
        .status(404)
        .json({ message: 'No existe un usuario con ese ID' });
    }
    next(error)
  }
}
