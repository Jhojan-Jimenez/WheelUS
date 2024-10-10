import { formatZodErrors, vehicleSchema } from "../lib/validators.js";
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
  static async postVehicle(req, res) {
    try {
      const vehicleData = req.body;
      const validData = vehicleSchema.safeParse(vehicleData);
      if (!validData.success) {
        throw formatZodErrors(validData.error.format());
      }
      await vehiclesModel.createVehicle(vehicleData);
      res.status(200).json({
        message: "Vehicle registration successful",
        vehicle: vehicleData,
      });
    } catch (error) {
      if (error.message === "This Plate Exist") {
        return res.status(400).json({ message: error.message });
      } else if (error.message === "A driver only could have 1 car") {
        return res.status(400).json({ message: error.message });
      } else if (error.message === incorrect_information) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }
}

export default vehicleController;
