import { db } from '../config/database.js';
import admin from 'firebase-admin';
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
  static async getRideById(id) {
    const ride = await db.collection('rides').doc(id).get();
    if (!ride.exists) {
      throw new Error('RideNotFound');
    }
    return ride.data();
  }
  static async createRide(rideData) {
    await vehiclesModel.getVehicleByPlate(rideData.vehicle_plate);
    const ride = await db
      .collection('rides')
      .add({ ...rideData, isActive: true, passengers: [] });
    await vehiclesModel.addRideToVehicle(ride.id, rideData.vehicle_plate);
    return ride.id;
  }
  static async patchRidePassengers(rideId, userId) {
    const userRef = db.collection('rides').doc(rideId);
    const { available_seats } = await ridesModel.getRideById(rideId);

    await userRef.update({
      passengers: admin.firestore.FieldValue.arrayUnion(userId),
      available_seats: available_seats - 1,
    });
  }
}

export default ridesModel;
