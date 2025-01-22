import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    minLength: [6, "Email must be at least 6 characters or long"],
    maxLenght: [50, "Email must be less then or equal to 50 characters"],
  },
  password: {
    type: String,
    select: false,
  },
});

userSchema.statics.hasPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.generateJwt = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
