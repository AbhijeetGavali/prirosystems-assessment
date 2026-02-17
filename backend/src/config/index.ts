import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  nodeEnv: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "8080", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/workflow_db",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
