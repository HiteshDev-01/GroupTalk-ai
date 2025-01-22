import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const verfiyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated !",
      });
    }

    const isBlackListed = await redisClient.get(token);

    if (isBlackListed) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "User is unauthenticated !",
      });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("User is not authenticated: ", error.message);
    return res.status(401).json({
      message: "User is not authenticated: " + error.message,
    });
  }
};
