import dotenv from 'dotenv/config.js'
import http from "http";
import app from "./app.js";
import connectDB from "./db/connectDB.js";
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken';
import { ProjectModel } from './models/project.model.js';
import mongoose from 'mongoose';
import { generateResult } from "./services/ai.service.js"

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.use(async (socket, next) => {
  try {
    // Extract token from handshake
    const token =
      socket.handshake?.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error("Authorization error: No token provided!"));
    }

    // Validate projectId from query
    const projectId = socket.handshake.query?.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Project ID is not valid!"));
    }

    // Find the project and assign to socket
    const project = await ProjectModel.findOne({ _id: projectId });

    if (!project) {
      return next(new Error("Project not found!"));
    }

    socket.project = project;

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!decoded) {
      return next(new Error("Invalid token!"));
    }

    socket.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Failed to establish a socket.io connection:", error.message);
    next(new Error("Internal server error during authentication!"));
  }
});

io.on('connection', (socket) => {
  try {
    // Join the project-specific room
    const roomId = socket.project._id.toString();
    socket.join(roomId);

    console.log("Connection is established for project:", roomId);

    // Handle project messages
    socket.on("project-message", async (data) => {
      const msg = data.message;
      const isAiPresent = msg.includes("@ai");

      const prompt = msg.replace("@ai", " ");

      const result = await generateResult(prompt);

      if (isAiPresent) {
        io.to(roomId).emit("project-message", {
          message: result,
          sender: {
            user: '@ai',
            email: 'AI'
          }
        })
        return;
      }

      socket.broadcast.to(roomId).emit("project-message", data);
    });

    // Handle other events
    socket.on('event', (data) => {
      console.log("Event received:", data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      socket.leave(roomId)
    });
  } catch (error) {
    console.error("Error during connection handling:", error.message);
  }
});

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server started listening on ${PORT}`);
});
