import admin from 'firebase-admin';
import { db } from '../config/database.js';
import {
  hashPassword,
  obtainLocalTime,
  savePhotoInStorage,
} from '../lib/utils.js';
import ridesModel from './rides.js';
import vehiclesModel from './vehicles.js';
import { UserNotFoundError } from '../errors/CustomErrors.js';
import { addNotification } from './notifications.js';
import { sendNotificationToUser } from '../middlewares/webSockets.js';
class usersModel {
  static async existUser({ email, password }) {
    const hashedPassword = hashPassword(password);

    const user = await db
      .collection('users')
      .where('email', '==', email)
      .where('password', '==', hashedPassword)
      .get();
    if (user.empty) {
      throw new Error('UserNotFound');
    }
    return user;
  }
  static async getUserById(id) {
    const user = await db.collection('users').doc(id).get();
    if (!user.exists) {
      throw new UserNotFoundError(`El usuario con el ID "${id}" no existe`);
    }
    const { password, ...userData } = user.data();
    return userData;
  }
  static async getUserByEmail(email) {
    const user = await db.collection('users').where('email', '==', email).get();
    if (emailSnapshot.empty) {
      throw new UserNotFoundError(
        `El usuario con el email "${email}" no existe`
      );
    }
    const { password, ...userData } = user.docs[0].data();
    return userData;
  }
  static async userNotifications(id) {
    const user = await this.getUserById(id);
    if (!user.notifications) {
      return [];
    }
    return user.notifications;
  }
  static async patchUser(id, newData) {
    const userRef = db.collection('users').doc(id);
    const updateData = { ...newData };

    if (newData.photo) {
      const photoUrl = await savePhotoInStorage(newData.photo);
      updateData.photo = photoUrl;
    }

    await userRef.update(updateData);
  }
  static async addUserRides(id, { rideId, arrivalPoints }) {
    const rideRef = db.collection('rides').doc(rideId);
    const userRef = db.collection('users').doc(id);
    if (!arrivalPoints || arrivalPoints.length === 0) {
      throw new Error('NoArrivalPoints');
    }

    const vehicle = await vehiclesModel.getVehicleByPlate(
      (await rideRef.get()).data().vehicle_plate
    );
    const driverRef = db.collection('users').doc(vehicle.id_driver);

    await db.runTransaction(async (transaction) => {
      const rideDoc = await transaction.get(rideRef);
      const userDoc = await transaction.get(userRef);

      if (!rideDoc.exists || !userDoc.exists) {
        throw new Error('Ride or User not found');
      }

      const rideData = rideDoc.data();
      const userData = userDoc.data();
      const availableSeats = rideData.available_seats;

      if (availableSeats < arrivalPoints.length) {
        throw new Error('NotEnoughSeats');
      }
      const passengers = rideData.passengers || [];

      const existingPassengerIndex = passengers.findIndex(
        (p) => p.userId === id
      );

      if (existingPassengerIndex >= 0) {
        passengers[existingPassengerIndex].cantidad += arrivalPoints.length;
        if (passengers[existingPassengerIndex].arrivalPoints) {
          passengers[existingPassengerIndex].arrivalPoints.push(
            ...arrivalPoints
          );
        }
      } else {
        passengers.push({
          userId: id,
          cantidad: arrivalPoints.length,
          arrivalPoints,
        });
      }

      transaction.update(rideRef, {
        passengers,
        available_seats: admin.firestore.FieldValue.increment(
          -arrivalPoints.length
        ),
      });

      const rides = userData.rides || [];
      arrivalPoints.forEach((point) => {
        const existingRideIndex = rides.findIndex(
          (p) => p.id === rideId && p.point === point
        );

        if (existingRideIndex >= 0) {
          rides[existingRideIndex].cantidad += 1;
        } else {
          rides.push({ id: rideId, point, cantidad: 1 });
        }
      });
      transaction.update(userRef, {
        rides,
      });
      arrivalPoints.forEach(async (point) => {
        await addNotification(
          driverRef,
          'ride',
          `${userData.name} ${userData.lastname} se ha unido a tu ride hasta ${point}`,
          obtainLocalTime()
        );
      });
    });
  }

  static async getUserRides(id) {
    const user = await this.getUserById(id);

    const ridesInfo = user.rides
      ? await Promise.all(
          user.rides.flatMap(async ({ id, point, cantidad }) => {
            const rideData = await ridesModel.getRideById(id);
            if (rideData.isActive) {
              // Genera un array replicado según la cantidad
              return Array.from({ length: cantidad }, () => ({
                id,
                point,
                ...rideData,
              }));
            }
            return [];
          })
        ).then((rides) => rides.flat().filter(Boolean))
      : [];

    return ridesInfo.sort(
      (a, b) => new Date(a.departure) - new Date(b.departure)
    );
  }
  static async deleteUserRide({ userId, rideId, point }) {
    const userRef = db.collection('users').doc(userId);
    const rideRef = db.collection('rides').doc(rideId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const rideDoc = await transaction.get(rideRef);

      if (!userDoc.exists || !rideDoc.exists) {
        throw new Error('User or Ride not found');
      }

      const userData = userDoc.data();
      const rideData = rideDoc.data();

      const vehicle = await vehiclesModel.getVehicleByPlate(
        rideData.vehicle_plate
      );
      const driverRef = db.collection('users').doc(vehicle.id_driver);

      const rideIndex = userData.rides.findIndex(
        (ride) => ride.id === rideId && ride.point === point
      );

      if (rideIndex === -1) {
        throw new Error('UserRideNotFound');
      }

      const ride = userData.rides[rideIndex];

      if (ride.cantidad > 1) {
        userData.rides[rideIndex].cantidad -= 1;
      } else {
        userData.rides.splice(rideIndex, 1);
      }

      transaction.update(userRef, {
        rides: userData.rides,
      });

      if (ride.cantidad === 1) {
        transaction.update(rideRef, {
          passengers: rideData.passengers.filter(
            (passenger) => passenger.userId !== userId
          ),
        });
      } else {
        transaction.update(rideRef, {
          passengers: rideData.passengers.map((passenger) => {
            if (passenger.userId === userId) {
              passenger.cantidad -= 1;
              passenger.arrivalPoints = passenger.arrivalPoints.filter(
                (p) => p !== point
              );
            }
            return passenger;
          }),
        });
      }

      transaction.update(rideRef, {
        available_seats: admin.firestore.FieldValue.increment(1),
      });

      const userName = `${userData.name} ${userData.lastname}`;

      transaction.update(driverRef, {
        notifications: admin.firestore.FieldValue.arrayUnion({
          type: 'ride',
          content: `${userName} abandonó tu ride hasta ${point}`,
          timestamp: obtainLocalTime(),
        }),
      });
      await sendNotificationToUser(
        userRef.id,
        `${userName} abandonó tu ride hasta ${point}`
      );
    });
  }

  static async postUser(userData, photo) {
    await uniqueUser(userData.id, userData.email);
    await saveUserInFirestore(userData, photo);
  }
  static async deleteAllUserNotifications(id) {
    const userRef = db.collection('users').doc(id);
    await userRef.update({ notifications: [] });
  }
}
async function uniqueUser(id, email) {
  const idSnapshot = await db.collection('users').doc(id).get();
  if (idSnapshot.exists) {
    throw new Error('IDAlreadyExists');
  }
  const emailSnapshot = await db
    .collection('users')
    .where('email', '==', email)
    .get();

  if (!emailSnapshot.empty) {
    throw new Error('EmailAlreadyExists');
  }
}

async function saveUserInFirestore(userData, photo) {
  const { name, lastname, contact, email, password, id } = userData;
  let photoUrl = null;
  if (photo) {
    photoUrl = await savePhotoInStorage(photo);
  }
  const hashedPassword = hashPassword(password);
  await db
    .collection('users')
    .doc(id)
    .set({
      name,
      lastname,
      contact,
      email,
      password: hashedPassword,
      photo: photoUrl || null,
    });
}
export default usersModel;
