import admin from 'firebase-admin';
import { db } from '../config/database.js';
import { hashPassword, savePhotoInStorage } from '../lib/utils.js';
import ridesModel from './rides.js';
import vehiclesModel from './vehicles.js';
import { UserNotFoundError } from '../errors/CustomErrors.js';
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
    const userRef = db.collection('users').doc(id);
    await userRef.update({
      notifications: [],
    });
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
  static async patchUserVehicle(id, plate) {
    await vehiclesModel.getVehicleByPlate(plate);
    const userRef = db.collection('users').doc(id);

    await userRef.update({
      vehicle_plate: plate,
    });
  }
  static async patchUserRides(id, { rideId, arrivalPoints }) {
    const ride = await ridesModel.getRideById(rideId);
    const vehicle = await vehiclesModel.getVehicleByPlate(ride.vehicle_plate);
    const user = await this.getUserById(id);
    const userRef = db.collection('users').doc(id);
    const rideRef = db.collection('rides').doc(rideId);
    const driverRef = db.collection('users').doc(vehicle.id_driver);
    const available_seats = (await rideRef.get()).data().available_seats;
    if (available_seats < arrivalPoints.length) {
      throw new Error('NotEnoughSeats');
    }

    await rideRef.update({
      available_seats: admin.firestore.FieldValue.increment(
        -arrivalPoints.length + 1
      ),
    });
    arrivalPoints.forEach(async (point) => {
      await userRef.update({
        rides: admin.firestore.FieldValue.arrayUnion({ rideId, point }),
      });
    });
    driverRef.update({
      notifications: admin.firestore.FieldValue.arrayUnion(
        `${user.name} ${user.lastname} se ha unido a tu ride`
      ),
    });
    await ridesModel.patchRidePassengers(rideId, id);
  }
  static async getUserRides(id) {
    const user = await this.getUserById(id);
    const ridesInfo = user.rides
      ? await Promise.all(
          user.rides.map(async ({ rideId, arrivalPoints }) => {
            const rideData = await ridesModel.getRideById(rideId);
            return rideData.isActive ? { rideId, ...rideData } : null;
          })
        ).then((rides) => rides.filter(Boolean))
      : [];

    return ridesInfo;
  }
  static async deleteUserRide({ userId, rideId, point }) {
    const ride = await ridesModel.getRideById(rideId);
    const vehicle = await vehiclesModel.getVehicleByPlate(ride.vehicle_plate);
    const userRef = db.collection('users').doc(userId);
    const rideRef = db.collection('rides').doc(rideId);
    const driverRef = db.collection('users').doc(vehicle.id_driver);
    const userData = await this.getUserById(userId);

    const hasRide = userData.rides.some(
      (ride) => ride.rideId === rideId && ride.point === point
    );

    if (!hasRide) {
      throw new Error('UserRideNotFound');
    }
    await userRef.update({
      rides: admin.firestore.FieldValue.arrayRemove({ rideId, point }),
    });
    const user = await this.getUserById(userId);
    driverRef.update({
      notifications: admin.firestore.FieldValue.arrayUnion(
        `${user.name} ${user.lastname} abandono tu ride`
      ),
    });

    await rideRef.update({
      available_seats: admin.firestore.FieldValue.increment(1),
    });
  }

  static async postUser(userData, photo) {
    await uniqueUser(userData.id, userData.email);
    await saveUserInFirestore(userData, photo);
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
