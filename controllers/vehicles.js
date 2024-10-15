import {
  PatchInmutableAtributes,
  validationErrors,
} from '../errors/CustomErrors.js';
import {
  validatePatchVehicleFields,
  vehiclePatchSchema,
  vehicleSchema,
} from '../lib/validators.js';
import vehiclesModel from '../models/vehicles.js';

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
      const photos = req.files;
      const vehiclePhoto =
        photos.vehiclePhoto && photos.vehiclePhoto.length > 0
          ? photos.vehiclePhoto[0]
          : null;
      const soat =
        photos.soat && photos.soat.length > 0 ? photos.soat[0] : null;

      const validData = vehicleSchema.safeParse({
        ...vehicleData,
        vehiclePhoto,
        soat,
      });
      const isValid = validationErrors(validData, res);
      if (isValid !== true) return;

      const finalData = await vehiclesModel.createVehicle(
        vehicleData,
        vehiclePhoto,
        soat
      );
      res.status(200).json({
        message: 'Vehiculo creado correctamente',
        vehicle: finalData,
      });
    } catch (error) {
      if (error.message === 'VehicleAlreadyExists') {
        return res
          .status(409)
          .json({ message: 'Un vehiculo con esta placa ya existe' });
      } else if (error.message === 'DriverAlreadyHasVehicle') {
        return res
          .status(409)
          .json({ message: 'Un usuario solo puede tener un vehiculo' });
      } else if (error.message === 'DriverNotFound') {
        return res
          .status(409)
          .json({ message: 'No existe un usuario con este ID' });
      }
      return res.status(500).json({ message: error.message });
    }
  }
  static async getVehicleByPlate() {
    const { plate } = req.params;
  }
  static async patchVehicle(req, res) {
    try {
      const { plate } = req.params;
      const newData = { ...req.body };
      const photos = req.files;
      if (photos) {
        const vehiclePhoto =
          photos.vehiclePhoto && photos.vehiclePhoto.length > 0
            ? photos.vehiclePhoto[0]
            : null;
        if (vehiclePhoto) {
          newData.photo = vehiclePhoto;
        }
        const soat =
          photos.soat && photos.soat.length > 0 ? photos.soat[0] : null;
        if (soat) {
          newData.soat = soat;
        }
      }
      const validData = vehiclePatchSchema.safeParse(newData);
      const isValid = validationErrors(validData, res);
      if (isValid !== true) return;
      validatePatchVehicleFields(newData);
      await vehiclesModel.patchVehicle(plate, newData);
      res.status(200).json({ message: 'Vehiculo Modificado correctamente' });
    } catch (error) {
      if (error instanceof PatchInmutableAtributes) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message_error: error.message });
    }
  }
  static async deleteVehicle() {
    const { plate } = req.params;
  }
}

export default vehicleController;
