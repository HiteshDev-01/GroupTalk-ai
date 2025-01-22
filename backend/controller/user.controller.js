import { validationResult } from "express-validator";
import * as userService from "../services/user.service.js";
import { User } from "../models/user.model.js";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  console.log(req.body);

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Create user
    const user = await userService.createUser(req.body);
    if (!user) {
      throw new Error("Failed to create the user");
    }

    // Remove password from response
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    // Generate token
    const token = user.generateJwt();
    if (!token) {
      throw new Error("Failed to generate token");
    }

    // Set cookie and respond
    return res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(201)
      .json({
        success: true,
        user: sanitizedUser,
        token,
      });
  } catch (error) {
    console.error("Failed to create the user:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const loginUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      sucess: false,
      message: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not exist or invalid credentials",
      });
    }

    const matchPassword = await user.validPassword(password);
    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const token = user.generateJwt();

    if (!token) {
      throw new Error("Failed to create the token");
    }

    delete user._doc.password;

    return res.status(200).json({
      sucess: true,
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Failed to login: ", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const profileController = async (req, res) => {
  console.log(req.user);

  return res.json({
    succes: true,
    User: req.user,
  });
};

export const logoutController = async (req, res) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "No token provided. User might already be logged out.",
    });
  }

  try {
    // Add token to the Redis blacklist with a 24-hour expiration
    await redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    // Clear the cookie if the token was passed via cookies
    if (req.cookies?.token) {
      res.clearCookie("token");
    }

    return res.status(200).json({
      success: true,
      message: "User successfully logged out",
    });
  } catch (error) {
    console.error("Failed to log out: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to log out: " + error.message,
    });
  }
};

export const getAllUserController = async (req, res) => {
  const { email } = req.user;
  try {
    const allUser = await userService.getAllUser({ userId: req.user.id });
    console.log(allUser);

    if (!allUser) {
      return res.status(400).json({
        message: "Failed to fetch all the user",
      });
    }

    return res.status(200).json({
      allUser
    });
  } catch (error) {
    console.error("Failed to fetch all the user !");
    return res.status(500).json({
      message: "Failed to fetch all the user: " + error.message,
    });
  }
};
