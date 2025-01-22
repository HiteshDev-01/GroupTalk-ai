import { Router } from "express";
import { body } from "express-validator";
import {
  createProjectController,
  getAllProjectsOfUserController,
  addUsersInProjectController,
  getProjectByIdController,
} from "../controller/project.controller.js";
import { verfiyToken } from "../middlewares/auth..middleware.js";

const router = Router();

router.post(
  "/create",
  verfiyToken,
  body("name").isString().withMessage("Name is required !"),
  createProjectController
);

router.get("/all-project", verfiyToken, getAllProjectsOfUserController);

router.put(
  "/add-user",
  verfiyToken,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of users id")
    .custom((users) => users.every((user) => typeof user === "string")),
  addUsersInProjectController
);

router.get("/:projectId", verfiyToken, getProjectByIdController);
export default router;
