import { db } from '../config/database.js';
import { savePhotoInStorage } from '../lib/utils.js';
import usersModel from './users.js';
import admin from 'firebase-admin';
class vehiclesModel {
  static async getAllVehicles() {
    try {
      const snapshot = await db.collection('vehicles').get();
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return rides;
    } catch (error) {
      console.error('Error obteniendo rides:', error);
    }
  }
  static async createVehicle(vehicleData, vehiclePhoto, soat) {
    await uniqueVehicle(vehicleData);
    const finalData = await saveVehicleInFirestore(
      vehicleData,
      vehiclePhoto,
      soat
    );
    await usersModel.patchUserVehicle(vehicleData.id_driver, vehicleData.plate);
    return finalData;
  }
  static async getVehicleByPlate(plate) {
    const vehicle = await db.collection('vehicles').doc(plate).get();
    if (!vehicle.exists) {
      throw new Error('VehicleNotFound');
    }
    return vehicle.data();
  }
  static async addRideToVehicle(rideId, plate) {
    const vehicleRef = db.collection('vehicles').doc(plate);

    await vehicleRef.update({
      rides: admin.firestore.FieldValue.arrayUnion(rideId),
    });
  }
  static async patchVehicle(plate, newData) {
    await vehiclesModel.getVehicleByPlate(plate);
    const vehicleRef = db.collection('vehicles').doc(plate);
    const updateData = { ...newData };
    if (newData.photo) {
      const vehiclePhotoUrl = await savePhotoInStorage(newData.photo);

      updateData.photo = vehiclePhotoUrl;
    }
    if (newData.soat) {
      const soatUrl = await savePhotoInStorage(newData.soat);

      updateData.SOAT = soatUrl;
    }

    await vehicleRef.update(updateData);
  }
}
async function uniqueVehicle(vehicleData) {
  const snapshot = await db.collection('vehicles').doc(vehicleData.plate).get();
  if (snapshot.exists) {
    throw new Error('VehicleAlreadyExists');
  }
  const snapshot2 = await db
    .collection('users')
    .doc(vehicleData.id_driver)
    .get();
  if (!snapshot2.exists) {d
    throw new Error('DriverNotFound');
  }
  const snapshot3 = await db
    .collection('vehicles')
    .where('id_driver', '==', vehicleData.id_driver)
    .get();
  if (!snapshot3.empty) {
    throw new Error('DriverAlreadyHasVehicle');
  }
}
async function saveVehicleInFirestore(vehicleData, vehiclePhoto, soat) {
  const { plate } = vehicleData;
  const vehiclePhotoUrl = await savePhotoInStorage(vehiclePhoto);
  const soatUrl = await savePhotoInStorage(soat);
  const finalData = { ...vehicleData, SOAT: soatUrl, photo: vehiclePhotoUrl };

  await db.collection('vehicles').doc(plate).set(finalData);
  return finalData;
}

export default vehiclesModel;
