import { ProjectModel } from "../models/project.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required !");
  }

  if (!userId) {
    throw new Error("userId is required !");
  }

  try {
    const project = await ProjectModel.create({
      name,
      users: [userId],
    });

    if (!project) {
      throw new Error("Failed to create the project");
    }

    return project;
  } catch (error) {
    console.error("Failed to create the project: ", error.message);
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
  }
};

export const getAllProject = async ({ userId }) => {
  if (!userId) {
    throw new Error("User id is required !");
  }

  try {
    const allProject = await ProjectModel.find({
      users: userId,
    });

    if (!allProject) {
      throw new Error("Failed to fetch all the project: ");
    }

    return allProject;
  } catch (error) {
    console.error("Failed to fetch all the project :", error.message);
  }
};

export const addUserInProject = async ({ projectId, users, userId }) => {

  if (!userId) {
    throw new Error("User id is required !");
  }

  if (!projectId) {
    throw new Error("Project id is required !");
  }

  // Validate the users array and check that all user IDs are valid
  if (
    !Array.isArray(users) ||
    users.some((user) => !mongoose.Types.ObjectId.isValid(user))
  ) {
    throw new Error("User IDs are required and must be valid!");
  }

  try {
    // Find the logged-in user
    const loggedInUser = await User.findById(userId);
    if (!loggedInUser) {
      throw new Error("User does not exist!");
    }

    // Update the project
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId, // Pass projectId directly, no need to wrap it in an object
      {
        $addToSet: {
          users: { $each: users }, // Adding users correctly
        },
      },
      { new: true } // Optionally return the updated project document
    );

    if (!updatedProject) {
      throw new Error("Project not found or update failed!");
    }

    return updatedProject;
  } catch (error) {
    console.error("Failed to add user in the project:", error.message);
    throw error; // Propagate the error
  }
};

export const getProjectById = async ({ projectId }) => {
  try {
    if (!projectId) {
      throw new Error("Project Id is required !");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Project Id is not in valid format !");
    }

    const project = await ProjectModel.findByIdAndUpdate(projectId).populate(
      "users"
    );

    return project;
  } catch (error) {
    console.error("Failed to get the project:" + error.message);
    throw error;
  }
};
