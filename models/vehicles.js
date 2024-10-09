import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  id_driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  plate: {
    type: String,
    required: true,
    unique: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  seats: {
    type: Number,
    min: 1,
    required: true,
  },
  SOAT: {
    type: String,
    required: true, // Almacena la ruta al archivo subido
  },
  photo: {
    type: String,
    required: true, // Almacena la ruta al archivo subido
  },
});

const Vehicles = mongoose.model("Vehicles", vehicleSchema);
class vehiclesModel {
  static async getAllVehicles() {
    // const ride = new rides({
    //   id_driver: "6705dbb6d574d0f9418233a9",

    //   origin: "U. Sabana",

    //   destination: "Av. 9",

    //   route: ["U. Sabana", "Av. 170", "Av. 127", "Av. 9"],

    //   departure: "2023-10-07T14:30:00Z",

    //   available_seats: 3,

    //   fee: 3000,
    // });
    // await ride.save();
    const vehicles = await Vehicles.find();
    return vehicles;
  }
}

export default vehiclesModel;
