import mongoose from "mongoose";
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.dbUrl;
  if (!uri || uri.includes("<password>"))
    throw new Error("Configure MONGO_URI in server/.env.");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to configured MongoDB database.");
    return mongoose.connection;
  } catch {
    throw new Error(
      "MongoDB connection failed. Check your connection string, Atlas network access, and database user permissions.",
    );
  }
};
export const closeDB = () => mongoose.disconnect();
