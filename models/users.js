import { auth, db } from "../config/database.js";
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
  static async createUser(userData) {
    try {
      const uid = await createUserInAuth(userData);
      await saveUserInFirestore(userData, uid);
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
async function saveUserInFirestore(userData, uid) {
  //   let photoUrl = null;

  //   if (photoFile) {
  //     const bucket = storage.bucket();
  //     const uniqueName = `${uuidv4()}_${photoFile.originalname}`;
  //     const file = bucket.file(uniqueName);
  //     const stream = file.createWriteStream({
  //       metadata: { contentType: photoFile.mimetype },
  //     });

  //     stream.end(photoFile.buffer);
  //     await stream;

  //     const [url] = await file.getSignedUrl({
  //       action: "read",
  //       expires: "03-09-2491",
  //     });
  //     photoUrl = url;
  //   }

  await db
    .collection("users")
    .doc(uid)
    .set({
      name: userData.name,
      lastname: userData.lastname,
      contact: userData.contact,
      photo: userData.photoUrl || null,
    });
}
export default usersModel;
