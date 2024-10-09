import sign from "jsonwebtoken/sign.js";
import { config } from "dotenv";

import usersModel from "../models/users.js";

class authController {
  static async login(req, res) {
    try {
      const authData = req.body;
      const user = await usersModel.getUser(authData);

      if (user.length === 0) {
        return res.status(403).json({ message: "User does not exists" });
      } else {
        const token = sign(
          { email: authData.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        res.cookie("authToken", token, {
          httpOnly: true,
          secure: true,
        });
        res
          .status(200)
          .json({ message: "User correctly logged in", accessToken: token });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  static async register(req, res) {
    try {
      const authData = req.body;
      const user = await usersModel.createUser(authData);
      console.log(user);

      if (user.length === 0) {
        return res.status(403).json({ message: "Error creating User" });
      } else {
        const token = sign(
          { email: authData.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        res.cookie("authToken", token, {
          httpOnly: true,
          secure: true,
        });
        res.status(200).json({ message: "User correctly created" }); //accessToken: token });
      }
    } catch (error) {
      //   if (error.message === "Duplicate user ID") {
      //     return res.status(500).json({
      //       message: " Duplicate key error. The ID already exists",
      //     });
      //   }

      return res.status(500).json({ message: error.message });
    }
  }
}

export default authController;
