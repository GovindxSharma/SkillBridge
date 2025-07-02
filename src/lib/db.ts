// src/lib/dbConnect.ts
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

declare global {
  var mongooseConnection: ConnectionObject;
}

const connection: ConnectionObject = global.mongooseConnection || {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("✅ MongoDB already connected.");
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME;

    if (!MONGODB_URI || !DB_NAME) {
      throw new Error("❌ MONGODB_URI or MONGODB_DB_NAME is not defined in .env");
    }

    const db = await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });

    connection.isConnected = db.connections[0].readyState;

    console.log(`✅ MongoDB connected to database: ${db.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV === "development") {
  global.mongooseConnection = connection;
}

export default dbConnect;


