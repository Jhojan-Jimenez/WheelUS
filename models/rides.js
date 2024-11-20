import { db } from '../config/database.js';
import admin from 'firebase-admin';
import vehiclesModel from './vehicles.js';
import { differenceBetweenHours } from '../lib/utils.js';
class ridesModel {
  static async getAllRides(queryParams) {
    const snapshot = await db.collection('rides').get();
    const rides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await Promise.all(
      rides.map(async (ride) => {
        if (differenceBetweenHours(ride.departure) < 0) {
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

      if (
        destination &&
        !ride.route.some(() => {
          return ride.route.includes(destination);
        })
      )
        return false;

      if (seats && ride.available_seats < seats) return false;

      return true;
    });

    return filteredRides;
  }

  static async getRideById(id) {
    const ride = await db.collection('rides').doc(id).get();
    if (differenceBetweenHours(ride.data().departure) < 0) {
      const rideRef = db.collection('rides').doc(ride.id);
      await rideRef.update({ isActive: false });
      return (await rideRef.get()).data();
    }
    if (!ride.exists) {
      throw new Error('RideNotFound');
    }
    return ride.data();
  }
  static async createRide(rideData) {
    const vehicle = await vehiclesModel.getVehicleByPlate(
      rideData.vehicle_plate
    );
    if (vehicle.seats < rideData.available_seats) {
      throw new Error('NotEnoughSeats');
    }
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

    if (differenceBetweenHours(rideData.departure) < 30) {
      throw new Error('RideHaveActivePassengers');
    }
    if (rideData.passengers && rideData.passengers.length > 0) {
      rideData.passengers.forEach(async (passenger) => {
        const userRef = db.collection('users').doc(passenger);

        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const updatedRides = (userDoc.data().rides || []).filter(
            (ride) => ride.rideId !== id
          );
          await userRef.update({
            rides: updatedRides,
            notifications: admin.firestore.FieldValue.arrayUnion(
              `Tu viaje de ${rideData.origin} a ${rideData.destination} ha sido cancelado`
            ),
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
  static async getRecommendedFee(start, end) {
    const snapshot = await db.collection('rides').get();
    const similarRides = snapshot.docs.filter(
      (doc) => doc.data().origin === start && doc.data().destination === end
    );
    if (similarRides.length > 0) {
      const fee =
        similarRides.reduce((acc, doc) => acc + doc.data().fee, 0) /
        similarRides.length;
      return fee;
    } else {
      return 5000;
    }
  }
  static async getStartingPoints() {
    const allRides = await this.getAllRides({});
    const points = allRides.map((doc) => doc.origin);

    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
  static async getEndingPoints() {
    const allRides = await this.getAllRides({});
    const points = allRides.flatMap((doc) => doc.route.slice(1));
    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
}

export default ridesModel;
