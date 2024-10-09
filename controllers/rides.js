import sign from "jsonwebtoken/sign.js";
import { config } from "dotenv";

import usersModel from "../models/users.js";
import ridesModel from "../models/rides.js";

class rideController {
  static async getRides(req, res) {
    try {
      const rides = await ridesModel.getAllRides();
      res.status(200).json({ rides: rides });
      //   if (user.length === 0) {
      //     return res.status(403).json({ message: "User does not exists" });
      //   } else {
      //     const token = sign(
      //       { email: authData.email },
      //       process.env.ACCESS_TOKEN_SECRET,
      //       { expiresIn: "1h" }
      //     );
      //     res.cookie("authToken", token, {
      //       httpOnly: true,
      //       secure: true,
      //     });
      //     res
      //       .status(200)
      //       .json({ message: "User correctly logged in", accessToken: token });
      //   }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default rideController;
