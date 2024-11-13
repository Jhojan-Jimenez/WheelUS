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
  static async deleteVehicle(plate) {
    const vehicleRef = db.collection('vehicles').doc(plate);
    const vehicleData = (await vehicleRef.get()).data();
    if (vehicleData.rides && vehicleData.rides.length > 0) {
      throw new Error('VehicleHaveActiveRides');
    }
    const userRef = db.collection('users').doc(vehicleData.id_driver);
    await vehicleRef.delete();
    await userRef.update({
      vehicle_plate: admin.firestore.FieldValue.delete(),
    });
  }
  static async getVehicleRides(plate) {
    const vehicle = await this.getVehicleByPlate(plate);

    const ridesInfo = vehicle.rides
      ? await Promise.all(
          vehicle.rides.map(async (rideId) => {
            const rideData = await ridesModel.getRideById(rideId);
            if (!rideData.isActive) return null;
            return { rideId, ...rideData };
          })
        ).then((rides) => rides.filter(Boolean))
      : [];

    return ridesInfo;
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
