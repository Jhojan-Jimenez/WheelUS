import admin from 'firebase-admin';
import { db } from '../config/database.js';
import { savePhotoInStorage } from '../lib/utils.js';
class usersModel {
  static async getUser({ email, password }) {
    const user = await db
      .collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();
    if (user.empty) {
      throw new Error("This user doesn't exists");
    }
    return user;
  }
  static async getUserById(id) {
    const user = await db.collection('users').doc(id).get();
    if (!user.exists) {
      throw new Error('User with this ID, does not exists');
    }

    return user;
  }
  static async getUserByEmail(email) {
    const user = await db.collection('users').where('email', '==', email).get();
    if (emailSnapshot.empty) {
      throw new Error('User with this email, does not exists');
    }
    return user;
  }
  static async patchUser(id, newData) {
    const user = await db.collection('users').doc(id).get();
    return user;
  }
  static async patchUserRides(id, rideId) {
    const userRef = db.collection('users').doc(id);

    await userRef.update({
      rides: admin.firestore.FieldValue.arrayUnion(rideId),
    });
  }
  static async postUser(userData, photo) {
    await uniqueUser(userData.id, userData.email);
    await saveUserInFirestore(userData, photo);
  }
}
async function uniqueUser(id, email) {
  const idSnapshot = await usersModel.getUserById(id);
  if (idSnapshot.exists) {
    throw new Error('This ID Already Exists');
  }
  const emailSnapshot = await usersModel.getUserByEmail(email);

  if (!emailSnapshot.empty) {
    throw new Error('This Email Already Exists');
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
