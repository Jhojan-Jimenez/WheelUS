import {
  PatchInmutableAtributes,
  UserNotFoundError,
  validationErrors,
} from '../errors/CustomErrors.js';
import { userPatchSchema, validatePatchUserFields } from '../lib/validators.js';
import usersModel from '../models/users.js';

class userController {
  static async getUser(req, res) {
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
      const { rideId } = req.body;
      await usersModel.patchUserRides(id, rideId);
      res.status(200).json({ message: 'Viaje agendado correctamente' });
    } catch (error) {
      if (error.message === 'RideNotFound') {
        return res
          .status(404)
          .json({ message: 'No existe o no esta activo dicho wheels' });
      }
      next(error)
    }
  }
}

export default userController;
