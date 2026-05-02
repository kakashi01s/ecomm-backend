import { server } from "./app.js";
import dotenv from "dotenv";
import { redisManager } from "./config/redisClient.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 7001;


async function startServer() {
  try {
    await redisManager.connect();
    
    server.listen(PORT, () => {
      console.log("Server Running on PORT: ", PORT);
    });
  } catch (err) {
    console.error("Failed to connect to Redis or start server:", err);
    process.exit(1);
  }
}

startServer();