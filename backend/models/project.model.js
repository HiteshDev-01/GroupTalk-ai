import mongoose, { trusted } from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true
    },
  ],
});

export const ProjectModel = mongoose.model("project", projectSchema);
