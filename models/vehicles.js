import { db } from "../config/database.js";
class vehiclesModel {
  static async getAllVehicles() {
    try {
      const snapshot = await db.collection("vehicles").get();
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return rides;
    } catch (error) {
      console.error("Error obteniendo rides:", error);
    }
  }
  static async createVehicle(vehicleData) {
    try {
      const snapshot = await db
        .collection("vehicles")
        .where("plate", "==", vehicleData.plate)
        .get();
      if (!snapshot.empty) {
        throw new Error("This Plate Exist");
      }
      const snapshot2 = await db
        .collection("vehicles")
        .where("id_driver", "==", vehicleData.id_driver)
        .get();
      if (!snapshot2.empty) {
        throw new Error("A driver only could have 1 car");
      }
      await db.collection("vehicles").add(vehicleData);
    } catch (error) {
      throw error;
    }
  }
}

export default vehiclesModel;
