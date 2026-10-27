// Explicit, disposable demonstration. Never connects to the configured Atlas database.
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
process.env.DOTENV_CONFIG_PATH = fileURLToPath(new URL("./preview.env", import.meta.url));
process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";
process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
process.env.RAZORPAY_KEY_ID = "";
process.env.RAZORPAY_KEY_SECRET = "";
const { default: app } = await import("../index.js");
const { seedDatabase } = await import("../utils/seedData.js");
const database = await MongoMemoryServer.create();
await mongoose.connect(database.getUri());
await seedDatabase();
const {addShowcaseContent}=await import("../utils/showcaseData.js");
await addShowcaseContent();
const server = app.listen(8080, () =>
  console.log(
    "DEMO ONLY: API on port 8080. All sample data is temporary; payments are disabled.",
  ),
);
const close = async () => {
  server.close();
  await mongoose.disconnect();
  await database.stop();
  process.exit(0);
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
