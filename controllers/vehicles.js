import vehiclesModel from "../models/vehicles.js";

class vehicleController {
  static async getVehicles(req, res) {
    try {
      const vehicles = await vehiclesModel.getAllVehicles();
      res.status(200).json({ vehicles: vehicles });
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

export default vehicleController;
