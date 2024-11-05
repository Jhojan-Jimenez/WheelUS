import sign from 'jsonwebtoken/sign.js';
import { userRegSchema } from '../lib/validators.js';
import usersModel from '../models/users.js';
import { validationErrors } from '../errors/CustomErrors.js';

class authController {
  static async login(req, res, next) {
    try {
      const authData = req.body;
      const user = await usersModel.existUser(authData);
      const userId = user.docs[0].id;
      const token = createToken(userId);
      res.status(200).json({ message: 'Login exitoso', accessToken: token });
    } catch (error) {
      if (error.message === 'UserNotFound') {
        return res
          .status(404)
          .json({ message: 'No existe un usuario con tales credenciales' });
      }
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const authData = req.body;
      const photo = req.file;
      const validData = userRegSchema.safeParse({ ...authData, photo: photo });
      const isValid = validationErrors(validData, res);
      if (isValid !== true) return;
      await usersModel.postUser(authData, photo);
      const token = createToken(authData.id);
      res.status(200).json({
        message: 'Usuario correctamente registrado',
        accessToken: token,
      });
    } catch (error) {
      if (error.message === 'EmailAlreadyExists') {
        return res.status(409).json({
          message: 'Un usuario con este email ya existe',
        });
      } else if (error.message === 'IDAlreadyExists') {
        return res.status(409).json({
          message: 'Un usuario con este ID ya existe',
        });
      }

      next(error);
    }
  }
}
function createToken(id) {
  return sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
}

export default authController;
