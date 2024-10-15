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
  static async patchUserRides(id, rideId) {
    await ridesModel.getRideById(rideId);
    const userRef = db.collection('users').doc(id);

    await userRef.update({
      rides: admin.firestore.FieldValue.arrayUnion(rideId),
    });
    await ridesModel.patchRidePassengers(rideId, id);
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
