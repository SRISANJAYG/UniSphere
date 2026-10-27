// Explicit, disposable demonstration. Never connects to the configured Atlas database.
import crypto from "node:crypto";
import fs from "node:fs";
import { parse } from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
process.env.DOTENV_CONFIG_PATH = fileURLToPath(new URL("./preview.env", import.meta.url));
process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";
process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
process.env.RAZORPAY_KEY_ID = "";
process.env.RAZORPAY_KEY_SECRET = "";
process.env.DEMO_PASSWORD = crypto.randomBytes(18).toString("base64url");
// Explicit opt-in: read only Razorpay test keys, never the Atlas URI or JWT.
if (process.argv.includes("--payments")) {
  const localSettings = parse(fs.readFileSync(new URL("../.env", import.meta.url)));
  if (!localSettings.RAZORPAY_KEY_ID?.startsWith("rzp_test_") || !localSettings.RAZORPAY_KEY_SECRET) {
    throw new Error("Valid Razorpay test credentials are required for demo:payments.");
  }
  process.env.RAZORPAY_KEY_ID = localSettings.RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = localSettings.RAZORPAY_KEY_SECRET;
}
fs.writeFileSync(new URL("../.demo-access.json", import.meta.url), JSON.stringify({student:"alex@unisphere.edu",faculty:"vance@unisphere.edu",password:process.env.DEMO_PASSWORD},null,2));
const { default: app } = await import("../index.js");
const { seedDatabase } = await import("../utils/seedData.js");
const database = await MongoMemoryServer.create();
await mongoose.connect(database.getUri());
await seedDatabase();
const {addShowcaseContent}=await import("../utils/showcaseData.js");
await addShowcaseContent();
const server = app.listen(8080, () =>
  console.log(
    "SHOWCASE API on port 8080. Temporary sample data. " + (process.env.RAZORPAY_KEY_ID ? "Razorpay TEST MODE enabled; no real charges." : "Payments disabled."),
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
