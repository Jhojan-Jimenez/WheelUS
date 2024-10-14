import { db } from '../config/database.js';
import vehiclesModel from './vehicles.js';
class ridesModel {
  static async getAllRides() {
    try {
      const snapshot = await db.collection('rides').get();
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return rides;
    } catch (error) {
      console.error('Error obteniendo rides:', error);
    }
  }
  static async createRide(rideData) {
    await vehiclesModel.getVehicleByPlate(rideData.vehicle_plate);
    const ride = await db
      .collection('rides')
      .add({ ...rideData, isActive: true, passengers: [] });
    await vehiclesModel.addRideToVehicle(ride.id, rideData.vehicle_plate);
    return ride.id;
  }
}

export default ridesModel;
