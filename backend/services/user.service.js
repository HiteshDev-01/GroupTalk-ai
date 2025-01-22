import { User } from "../models/user.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required !");
  }

  const user = await User.findOne({ email });

  const hasPassword = await User.hasPassword(password);

  try {
    const user = await User.create({
      email,
      password: hasPassword,
    });

    if (!user) {
      throw new Error("Failed to create the user");
    }

    return user;
  } catch (error) {
    console.log("Failed to create the user: ", error.message);
  }
};

export const getAllUser = async ({ userId }) => {
  console.log(userId);
  if (!userId) {
    throw new Error("UserId is required!");
  }

  try {
    // Correct MongoDB query
    const allUser = await User.find({ _id: { $ne: userId } });

    if (!allUser || allUser.length === 0) {
      throw new Error("No users found");
    }

    return allUser; // Return the result
  } catch (error) {
    console.error("Failed to fetch all the user: " + error.message);
    throw error; // Rethrow the error to propagate it
  }
};
