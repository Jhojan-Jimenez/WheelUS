import {
  PatchInmutableAtributes,
  UserNotFoundError,
  validationErrors,
} from '../errors/CustomErrors.js';
import { userPatchSchema, validatePatchUserFields } from '../lib/validators.js';
import usersModel from '../models/users.js';
import jsonwebtoken from 'jsonwebtoken';

class userController {
  static async getUserByToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const { id } = jsonwebtoken.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
      const user = await usersModel.getUserById(id);
      res.status(200).json({ user: { ...user, id: id } });
    } catch (error) {
      next(error);
    }
  }
  static async getUserByID(req, res) {
    res.status(200).json({ user: req.user });
  }

  static async patchUser(req, res, next) {
    try {
      const { id } = req.params;
      const newData = { ...req.body };
      if (req.file) {
        newData.photo = req.file;
      }
      const validData = userPatchSchema.safeParse(newData);
      const isValid = validationErrors(validData, res);
      if (isValid !== true) return;
      validatePatchUserFields(newData);

      await usersModel.patchUser(id, newData);
      res.status(200).json({ message: 'Usuario Modificado correctamente' });
    } catch (error) {
      if (error instanceof PatchInmutableAtributes) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
  static async patchUserRides(req, res, next) {
    try {
      const { id } = req.params;
      const { rideId, arrivalPoints } = req.body;
      await usersModel.patchUserRides(id, { rideId, arrivalPoints });
      res.status(200).json({ message: 'Viaje agendado correctamente' });
    } catch (error) {
      if (error.message === 'RideNotFound') {
        return res
          .status(404)
          .json({ message: 'No existe o no esta activo dicho wheels' });
      } else if (error.message === 'NotEnoughSeats') {
        return res
          .status(400)
          .json({ message: 'No hay suficientes asientos disponibles' });
      }
      next(error);
    }
  }
  static async getUserRides(req, res, next) {
    try {
      const { id } = req.params;
      const userRides = await usersModel.getUserRides(id);
      res.status(200).json({ userRides: userRides });
    } catch (error) {
      if (error.message === 'RideNotFound') {
        return res
          .status(404)
          .json({ message: 'No existe o no esta activo dicho wheels' });
      }
      next(error);
    }
  }
  static async deleteUserRide(req, res, next) {
    try {
      const { id } = req.params;
      const { point, rideId } = req.query;
      await usersModel.deleteUserRide({ userId: id, rideId, point });
      res.status(200).json({ message: 'Viaje eliminado correctamente' });
    } catch (error) {
      if (error.message === 'UserRideNotFound') {
        return res
          .status(404)
          .json({ message: 'Este usuario no tiene este ride como reserva' });
      }
      next(error);
    }
  }
  static async getUserNotifications(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const { id } = jsonwebtoken.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
      const notifications = await usersModel.userNotifications(id);
      res.status(200).json({ notifications: notifications });
    } catch (error) {
      next(error);
    }
  }
}

export default userController;
