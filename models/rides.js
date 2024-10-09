import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  id_driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  route: [
    {
      type: String,
      required: true,
    },
  ],
  departure: {
    type: Date,
    required: true,
  },
  available_seats: {
    type: Number,
    min: 0,
    required: true,
  },
  fee: {
    type: Number,
    min: 0,
    required: true,
  },
});

const Rides = mongoose.model("rides", rideSchema);
class ridesModel {
  static async getAllRides() {
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
    const rides = await Rides.find();
    return rides;
  }
}

export default ridesModel;
