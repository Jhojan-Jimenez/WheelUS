import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  contact: {
    type: Number,
  },
  photo: {
    type: String,
    default: null,
  },
});

const Users = mongoose.model("users", userSchema);
class usersModel {
  static async getUser({ email, password }) {
    const user = await Users.find({ email: email, password: password });
    return user;
  }
  static async createUser({ name, lastname, id, email, password, contact }) {
    try {
      const newUser = new Users({
        name,
        lastname,
        id,
        email,
        password,
        contact,
      });
      await newUser.save();
      return newUser;
    } catch (error) {
      throw error;
    }
  }
}

export default usersModel;
