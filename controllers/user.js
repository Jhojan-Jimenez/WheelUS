import sign from 'jsonwebtoken/sign.js';
import usersModel from '../models/users.js';
import { formatZodErrors, userRegSchema } from '../lib/validators.js';

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
    // try {
    //   const authData = req.body;
    //   const photo = req.file;
    //   const validData = userRegSchema.safeParse(authData);
    //   if (!validData.success) {
    //     throw formatZodErrors(validData.error.format());
    //   }
    //   const user = await usersModel.createUser(authData, photo);
    //   if (user.length === 0) {
    //     return res.status(403).json({ message: 'Error creating User' });
    //   } else {
    //     const token = sign(
    //       { email: authData.email },
    //       process.env.ACCESS_TOKEN_SECRET,
    //       { expiresIn: '1h' }
    //     );
    //     res.cookie('authToken', token, {
    //       httpOnly: true,
    //       secure: true,
    //     });
    //     res
    //       .status(200)
    //       .json({ message: 'User correctly created', accessToken: token });
    //   }
    // } catch (error) {
    //   //   if (error.message === "Duplicate user ID") {
    //   //     return res.status(500).json({
    //   //       message: " Duplicate key error. The ID already exists",
    //   //     });
    //   //   }
    //   return res.status(500).json({ message_error: error.message });
    // }
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
