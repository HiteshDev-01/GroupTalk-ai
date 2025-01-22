import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, size: "16kb" }));
app.use(cookieParser());
app.use(cors());

// for cheking which has been encounterd
app.use(morgan("dev"));
app.get("/", () => {
  console.log("Server started");
});

import userRouter from "./routes/user.routes.js";
import ProjectRouter from "./routes/project.routes.js";
import aiRouter from "./routes/ai.routes.js"
app.use("/users", userRouter);
app.use("/project", ProjectRouter);
app.use("/ai", aiRouter);

export default app;
