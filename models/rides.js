import { db } from '../config/database.js';
import admin from 'firebase-admin';
import vehiclesModel from './vehicles.js';
import { obtainLocalTime } from '../lib/utils.js';
import { differenceInMinutes } from 'date-fns';
class ridesModel {
  static async getAllRides(queryParams) {
    const snapshot = await db.collection('rides').get();
    const rides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await Promise.all(
      rides.map(async (ride) => {
        if (
          differenceInMinutes(new Date(ride.departure), obtainLocalTime()) < 0
        ) {
          const rideRef = db.collection('rides').doc(ride.id);
          await rideRef.update({ isActive: false });
          ride.isActive = false;
        }
      })
    );

    const filteredRides = rides.filter((ride) => {
      const { origin, destination, seats } = queryParams;

      if (!ride.isActive) return false;

      if (origin && ride.origin !== origin) return false;

      if (destination && ride.destination !== destination)
        return false;

      if (seats && ride.available_seats < seats) return false;

      return true;
    });

    return filteredRides;
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
  static async deleteRide(id) {
    const rideRef = db.collection('rides').doc(id);
    const rideData = (await rideRef.get()).data();

    if (
      differenceInMinutes(new Date(rideData.departure), obtainLocalTime()) < 30
    ) {
      throw new Error('RideHaveActivePassengers');
    }
    if (rideData.passengers && rideData.passengers.length > 0) {
      rideData.passengers.forEach(async (passenger) => {
        const userRef = db.collection('users').doc(passenger);

        // Obtiene el documento del usuario
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          // Filtramos el arreglo 'rides' para eliminar el objeto con rideId == id
          const updatedRides = (userDoc.data().rides || []).filter(
            (ride) => ride.rideId !== id
          );

          // Actualizamos el campo 'rides' con el nuevo arreglo
          await userRef.update({
            rides: updatedRides,
          });
        }
      });
    }
    const vehicleRef = db.collection('vehicles').doc(rideData.vehicle_plate);
    await vehicleRef.update({
      rides: admin.firestore.FieldValue.arrayRemove(id),
    });
    await rideRef.delete();
  }
  static async getStartingPoints() {
    const snapshot = await db.collection('rides').get();
    const points = snapshot.docs.map((doc) => doc.data().origin);
    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
  static async getEndingPoints() {
    const snapshot = await db.collection('rides').get();
    const points = snapshot.docs.map((doc) => doc.data().destination);
    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
}

export default ridesModel;
