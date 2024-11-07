import admin from 'firebase-admin';
import { db } from '../config/database.js';
import { savePhotoInStorage } from '../lib/utils.js';
import ridesModel from './rides.js';
import vehiclesModel from './vehicles.js';
import { UserNotFoundError } from '../errors/CustomErrors.js';
class usersModel {
  static async existUser({ email, password }) {
    const user = await db
      .collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
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
    await ridesModel.getRideById(rideId);
    const userRef = db.collection('users').doc(id);
    const rideRef = db.collection('rides').doc(rideId);
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
    await ridesModel.patchRidePassengers(rideId, id);
  }
  static async getUserRides(id) {
    const user = await this.getUserById(id);
    const ridesInfo = user.rides
      ? (
          await Promise.all(
            user.rides.map(async ({ rideId, arrivalPoints }) => {
              const rideData = await ridesModel.getRideById(rideId);
              return rideData.isActive ? { rideId, ...rideData } : undefined;
            })
          )
        ).filter(Boolean)
      : [];

    return ridesInfo;
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
  await db
    .collection('users')
    .doc(id)
    .set({
      name,
      lastname,
      contact,
      email,
      password,
      photo: photoUrl || null,
    });
}
export default usersModel;
