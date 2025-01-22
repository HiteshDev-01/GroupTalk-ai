import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
});


redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (error) => {
  console.log("Redis connection error:", error.message);
});

export default redisClient;
