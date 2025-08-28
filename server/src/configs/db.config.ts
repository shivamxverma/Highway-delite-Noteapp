import mongoose from "mongoose";
import { DATABASE_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        const mongoUri = process.env.MONGO_URI.endsWith("/")
            ? `${process.env.MONGO_URI}${DATABASE_NAME}`
            : `${process.env.MONGO_URI}/${DATABASE_NAME}`;
        console.log(`MongoDB URI: ${mongoUri}`);
        const connectionInstance = await mongoose.connect(mongoUri);

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

        console.log("Connection successful!");

    } catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;