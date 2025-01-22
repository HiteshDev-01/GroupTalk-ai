import { Router } from "express";
import { body } from "express-validator";
import {
  createUserController,
  getAllUserController,
  loginUserController,
  logoutController,
  profileController,
} from "../controller/user.controller.js";
import { verfiyToken } from "../middlewares/auth..middleware.js";

const router = Router();

router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Email must be required or at least 6 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be required or at least 6 characters long"),
  createUserController
);

router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Email must be required or at least 6 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be required or at least 6 characters long"),
  loginUserController
);

router.get("/", verfiyToken, profileController);

router.get("/logout", verfiyToken, logoutController);

router.get("/all-user", verfiyToken, getAllUserController);

export default router;
