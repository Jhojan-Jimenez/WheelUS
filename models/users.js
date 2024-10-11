import { auth, db, storage } from "../config/database.js";

class usersModel {
  static async getUser({ email, password }) {
    try {
      //Para saber si el email y la contrasñea son iguales toca hacerlo en el front y devolver un tokenID
      const user = await auth.getUserByEmail(email);
      return user;
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        throw new Error("User doesn't exists");
      } else {
        throw error;
      }
    }
  }
  static async createUser(userData, photo) {
    try {
      const uid = await createUserInAuth(userData);
      await saveUserInFirestore(userData, photo, uid);
      return uid;
    } catch (error) {
      throw error;
    }
  }
}

async function createUserInAuth({ name, lastname, id, email, password }) {
  const userRecord = await auth.createUser({
    email: email,
    password: password,
    displayName: `${name} ${lastname}`,
    uid: id.toString(),
  });
  return userRecord.uid;
}
async function saveUserInFirestore(userData, photo, uid) {
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
    .doc(uid)
    .set({
      name: userData.name,
      lastname: userData.lastname,
      contact: userData.contact,
      photo: photoUrl || null
    });
}
export default usersModel;
