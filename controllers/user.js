import { userPatchSchema, validatePatchUser } from '../lib/validators.js';
import usersModel from '../models/users.js';

class userController {
  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await usersModel.getUserById(id);
      res.status(200).json({ user: user });
    } catch (error) {
      if (error.message === 'User with this ID, does not exists') {
        return res
          .status(403)
          .json({ message: 'User with this ID, does not exists' });
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
      if (!validData.success) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validData.error.format(),
        });
      }
      validatePatchUser(newData);

      await usersModel.patchUser(id, newData);
      res.status(200).json({ message: 'Usuario Modificado correctamente' });
    } catch (error) {
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
      return res.status(500).json({ message_error: error.message });
    }
  }
}

export default userController;
