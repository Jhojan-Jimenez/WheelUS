import { db, storage } from "../config/database.js";
class usersModel {
  static async getUser({ email, password }) {
    try {
      const user = await db
        .collection("users")
        .where("email", "==", email)
        .where("password", "==", password)
        .get();
      return user;
    } catch (error) {
      throw error;
    }
  }
  static async postUser(userData, photo) {
    try {
      await uniqueUser(userData.id, userData.email);
      await saveUserInFirestore(userData, photo);
    } catch (error) {
      throw error;
    }
  }
}
async function uniqueUser(id, email) {
  const idSnapshot = await db.collection("users").where("id", "==", id).get();

  if (!idSnapshot.empty) {
    throw new Error("This ID Already Exists");
  }
  const emailSnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!emailSnapshot.empty) {
    throw new Error("This Email Already Exists");
  }
}

async function saveUserInFirestore(userData, photo) {
  let photoUrl = null;

  if (photo) {
    const fileName = `${Date.now()}_${photo.originalname}`;
    const blob = storage.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: photo.mimetype,
      },
    });

    blobStream.end(photo.buffer);

    const [url] = await blob.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    photoUrl = url;
  }
  await db
    .collection("users")
    .doc(userData.email)
    .set({
      name: userData.name,
      lastname: userData.lastname,
      contact: userData.contact,
      email: userData.email,
      password: userData.password,
      id: userData.id,
      photo: photoUrl || null,
    });
}
export default usersModel;
