import {
  PatchInmutableAtributes,
  UserNotFoundError,
  validationErrors,
} from '../errors/CustomErrors.js';
import { userPatchSchema, validatePatchUserFields } from '../lib/validators.js';
import usersModel from '../models/users.js';

class userController {
  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await usersModel.getUserById(id);
      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  static async patchUser(req, res) {
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
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message_error: error.message });
    }
  }
  static async patchUserRides(req, res) {
    try {
      const { id } = req.params;
      const { rideId } = req.body;
      await usersModel.patchUserRides(id, rideId);
      res.status(200).json({ message: 'Viaje agendado correctamente' });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      } else if (error.message === 'RideNotFound') {
        return res
          .status(404)
          .json({ message: 'No existe o no esta activo dicho wheels' });
      }
      return res.status(500).json({ message_error: error.message });
    }
  }
}

export default userController;
