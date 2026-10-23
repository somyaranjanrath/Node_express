import { webcrypto } from "node:crypto";
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

import mongoose from "mongoose";

export const connectdb = async () => {
    if (!process.env.DB_URL) {
        console.error("Error: DB_URL environment variable is not defined in .env");
        return;
    }
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};