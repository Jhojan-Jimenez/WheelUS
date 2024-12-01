import { db } from '../config/database.js';
import { savePhotoInStorage } from '../lib/utils.js';
import ridesModel from './rides.js';
import usersModel from './users.js';
import admin from 'firebase-admin';
class vehiclesModel {
  static async getAllVehicles() {
    const snapshot = await db.collection('vehicles').get();
    const rides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return rides;
  }
  static async createVehicle(vehicleData, vehiclePhoto, soat) {
    await uniqueVehicle(vehicleData);
    const finalData = await saveVehicleInFirestore(
      vehicleData,
      vehiclePhoto,
      soat
    );
    console.log(vehicleData);

    const userRef = db.collection('users').doc(vehicleData.id_driver);

    await userRef.update({
      vehicle_plate: vehicleData.plate,
    });
    return finalData;
  }
  static async getVehicleByPlate(plate) {
    const vehicle = await db.collection('vehicles').doc(plate).get();
    if (!vehicle.exists) {
      throw new Error('VehicleNotFound');
    }
    return vehicle.data();
  }
  static async patchVehicle(plate, newData) {
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
  static async deleteVehicle(vehicleData) {
    if (vehicleData.rides && vehicleData.rides.length > 0) {
      throw new Error('VehicleHaveActiveRides');
    }
    const userRef = db.collection('users').doc(vehicleData.id_driver);
    await vehicleRef.delete();
    await userRef.update({
      vehicle_plate: admin.firestore.FieldValue.delete(),
    });
  }
  static async getVehicleRides(vehicle) {
    if (!vehicle.rides || vehicle.rides.length === 0) return [];
    const rideRefs = vehicle.rides.map((rideId) =>
      db.collection('rides').doc(rideId)
    );
    const snapshots = await db.getAll(...rideRefs);

    const ridesInfo = snapshots
      .filter((snap) => snap.exists && snap.data().isActive)
      .map((snap) => ({ id: snap.id, ...snap.data() }));

    return ridesInfo.sort(
      (a, b) => new Date(a.departure) - new Date(b.departure)
    );
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
  if (!snapshot2.exists) {
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
