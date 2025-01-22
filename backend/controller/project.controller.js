import { User } from "../models/user.model.js";
import {
  addUserInProject,
  createProject,
  getAllProject,
  getProjectById,
} from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(401).json({
        message: errors.array(),
      });
    }

    const { name } = req.body;

    console.log(req.user.email);
    const loggedInUser = await User.findOne({ email: req.user.email });

    const id = loggedInUser._id;

    const project = await createProject({
      name,
      userId: id,
    });

    if (!project) {
      return res.status(401).json({
        message: "Failed to create the project",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create the project:" + error.message,
    });
  }
};

export const getAllProjectsOfUserController = async (req, res) => {
  const { id } = req.user;

  const loggedInUser = await User.findById(id);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "User is not authenticated !",
    });
  }

  const userId = loggedInUser._id;

  try {
    const allProject = await getAllProject({ userId });

    if (!allProject) {
      return res.status(404).json({
        message: "Failed to fetch the all the projects",
      });
    }

    return res.status(200).json({
      allProject: allProject,
    });
  } catch (error) {
    console.error("Failed to fetch the project:", error.message);
    return res.status(400).json({
      message: "Failed to fetch the project" + error.message,
    });
  }
};

export const addUsersInProjectController = async (req, res) => {
  try {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { id } = req.user; // Ensure this is always available via middleware
    const { projectId, users } = req.body;

    // Check if projectId and users array are provided
    if (!projectId || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        message: "Project ID and a non-empty users array are required!",
      });
    }

    // Perform the main operation
    const updatedProject = await addUserInProject({
      projectId,
      users,
      userId: id,
    });

    if (!updatedProject) {
      return res.status(400).json({
        message: "Failed to update the project",
      });
    }

    // Success response
    return res.status(200).json({
      message: "Project updated successfully",
      updatedProject,
    });
  } catch (error) {
    // Log and return error
    console.error(`Error updating project: ${error.message}`);
    return res.status(500).json({
      message: `Failed to update project: ${error.message}`,
    });
  }
};

export const getProjectByIdController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        message: "Project id is required!",
      });
    }

    const project = await getProjectById({ projectId });

    if (!project) {
      return res.status(404).json({
        message: "Project not found!",
      });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Failed to get the project: " + error.message);
    return res.status(500).json({
      message: "Failed to get the project: " + error.message,
    });
  }
};

