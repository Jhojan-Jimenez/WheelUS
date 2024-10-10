import { db } from "../config/database.js";
class ridesModel {
  static async getAllRides() {
    try {
      const snapshot = await db.collection("rides").get();
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return rides;
    } catch (error) {
      console.error("Error obteniendo rides:", error);
    }
  }
  static async createRide(rideData) {
    try {
      await db.collection("rides").add(rideData);
    } catch (error) {
      throw error;
    }
  }
}

export default ridesModel;
