import { db } from '../config/database.js';
import admin from 'firebase-admin';
import { differenceBetweenHours, obtainLocalTime } from '../lib/utils.js';
import { addNotification } from './notifications.js';
class ridesModel {
  static async getAllRides(queryParams) {
    const {
      origin,
      destination,
      seats,
      offset = 0,
      limit,
      orderBy = 'departure',
    } = queryParams;

    const snapshot = await db.collection('rides').get();

    let rides = snapshot.docs.map((doc) => ({
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

    let filteredRides = rides.filter((ride) => {
      if (!ride.isActive) return false;
      if (origin && ride.origin !== origin) return false;
      if (seats && ride.available_seats < seats) return false;
      if (destination && !ride.route.some((point) => point === destination)) {
        return false;
      }
      return true;
    });

    filteredRides = filteredRides.sort((a, b) => {
      if (a[orderBy] < b[orderBy]) return -1;
      if (a[orderBy] > b[orderBy]) return 1;
      return 0;
    });

    const paginatedRides = filteredRides.slice(
      offset,
      limit ? offset + limit : undefined
    );

    return {
      total: filteredRides.length,
      rides: paginatedRides,
    };
  }
  static async getRideById(id) {
    const ride = await db.collection('rides').doc(id).get();
    if (differenceBetweenHours(ride.data().departure) < 0) {
      const rideRef = db.collection('rides').doc(ride.id);
      await rideRef.update({ isActive: false });
      throw new Error('InactiveRide');
    }
    if (!ride.exists) {
      throw new Error('RideNotFound');
    }
    return ride.data();
  }
  static async createRide(rideData) {
    const vehicleRef = db.collection('vehicles').doc(rideData.vehicle_plate);

    await db.runTransaction(async (transaction) => {
      const vehicleSnap = await transaction.get(vehicleRef);

      if (!vehicleSnap.exists) {
        throw new Error('VehicleNotFound');
      }

      const vehicle = vehicleSnap.data();

      if (vehicle.seats < rideData.available_seats) {
        throw new Error('NotEnoughSeats');
      }
      if (differenceBetweenHours(rideData.departure) < 0) {
        throw new Error('InvalidDeparture');
      }

      const rideRef = db.collection('rides').doc();
      transaction.set(rideRef, {
        ...rideData,
        isActive: true,
        passengers: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(vehicleRef, {
        rides: admin.firestore.FieldValue.arrayUnion(rideRef.id),
      });
    });
  }

  static async deleteRide(id) {
    const rideRef = db.collection('rides').doc(id);
    const rideSnapshot = await rideRef.get();

    const rideData = rideSnapshot.data();

    if (
      differenceBetweenHours(rideData.departure) < 30 &&
      rideData.passengers &&
      rideData.passengers.length > 0
    ) {
      throw new Error('RideCannotBeDeletedDueToProximity');
    }
    if (rideData.passengers && rideData.passengers.length > 0) {
      await Promise.all(
        rideData.passengers.map(async ({ userId }) => {
          const userRef = db.collection('users').doc(userId);
          const userSnapshot = await userRef.get();

          if (userSnapshot.exists) {
            const userData = userSnapshot.data();
            const updatedRides = (userData.rides || []).filter(
              (ride) => ride.rideId !== id
            );

            await Promise.all([
              userRef.update({ rides: updatedRides }),
              addNotification(
                userRef,
                'ride',
                `Tu viaje de ${rideData.origin} a ${rideData.destination} ha sido cancelado`,
                obtainLocalTime()
              ),
            ]);
          }
        })
      );
    }

    const vehicleRef = db.collection('vehicles').doc(rideData.vehicle_plate);
    await db.runTransaction(async (transaction) => {
      transaction.update(vehicleRef, {
        rides: admin.firestore.FieldValue.arrayRemove(id),
      });
      transaction.delete(rideRef);
    });
  }

  static async getRecommendedFee(start, end) {
    const snapshot = await db
      .collection('rides')
      .where('origin', '==', start)
      .where('destination', '==', end)
      .get();
    const similarRides = snapshot.docs;
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
    const allRides = await db.collection('rides').get();
    const points = allRides.docs.map((doc) => doc.data().origin);
    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
  static async getEndingPoints() {
    const allRides = await db.collection('rides').get();
    const points = allRides.docs.flatMap((doc) => doc.data().route.slice(1));
    const uniquePoints = [...new Set(points)];
    return uniquePoints;
  }
}

export default ridesModel;
