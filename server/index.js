import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import { seedDatabase } from "./utils/seedData.js";

import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import courseRoutes from "./routes/course.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import eventRoutes from "./routes/event.routes.js";
import clubRoutes from "./routes/club.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import studentRoute from "./routes/student.routes.js";

const app = express();
const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [CLIENT_URL]
    : [
        CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
      ].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or matched origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root welcome & health endpoints
app.get("/", (req, res) => {
  res.send(
    "Welcome to UniSphere API — University Student Community & Academic Platform!",
  );
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "UniSphere server is healthy and operational",
    timestamp: new Date().toISOString(),
    demo: process.env.DEMO_MODE === "true",
    testPaymentsEnabled: Boolean(process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") && process.env.RAZORPAY_KEY_SECRET),
  });
});

app.get("/api/about", (req, res) => {
  res.json({
    success: true,
    project: "UniSphere",
    tagline: "University Student Community & Academic Platform",
    description:
      "An all-in-one university student platform combining campus social network with academic organization, course resources, assignments, events, clubs, and peer discovery.",
    version: "1.0.0",
  });
});

app.use("/api", (req, res, next) => {
  const scalarFields = [
    "name",
    "username",
    "email",
    "password",
    "loginIdentifier",
    "bio",
    "department",
    "course",
    "year",
    "avatar",
    "content",
    "mediaUrl",
    "title",
    "description",
    "courseId",
    "dueDate",
    "submissionText",
    "attachmentUrl",
    "feedback",
    "url",
    "code",
    "instructor",
    "schedule",
    "room",
    "date",
    "time",
    "venue",
    "organizer",
    "banner",
    "category",
    "lead",
    "tagline",
    "logo",
    "eventId",
    "studentId",
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_signature",
  ];
  for (const field of scalarFields) {
    if (
      req.body?.[field] !== undefined &&
      (typeof req.body[field] !== "string" || req.body[field].length > 10000)
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid " + field + ". Enter text within 10,000 characters.",
        });
  }
  for (const field of [
    "avatar",
    "mediaUrl",
    "url",
    "attachmentUrl",
    "banner",
    "logo",
  ]) {
    if (req.body?.[field] && !/^https?:\/\//i.test(req.body[field]))
      return res
        .status(400)
        .json({
          success: false,
          message: "Use an HTTP or HTTPS URL for " + field + ".",
        });
  }
  for (const field of ["date", "dueDate"])
    if (req.body?.[field] && !Number.isFinite(Date.parse(req.body[field])))
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid date." });
  for (const field of ["credits", "capacity", "fee", "maxPoints", "grade"])
    if (
      req.body?.[field] !== undefined &&
      (!Number.isFinite(Number(req.body[field])) || Number(req.body[field]) < 0)
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a valid positive number for " + field + ".",
        });
  const pieces = req.path.split("/").filter(Boolean);
  if (
    pieces[1] &&
    [
      "posts",
      "courses",
      "assignments",
      "events",
      "clubs",
      "notifications",
    ].includes(pieces[0]) &&
    !["feed", "read-all"].includes(pieces[1]) &&
    !/^[a-f0-9]{24}$/i.test(pieces[1])
  )
    return res
      .status(400)
      .json({ success: false, message: "Invalid resource identifier." });
  if (
    req.method !== "GET" &&
    req.headers.origin &&
    !allowedOrigins.includes(req.headers.origin)
  )
    return res
      .status(403)
      .json({ success: false, message: "Origin is not allowed." });
  next();
});
// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes); // Alias for clean auth endpoints
app.use("/api/posts", postRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// Retain existing instructor practice student route
app.use("/", studentRoute);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "API route not found." }),
);
// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Request failed:", err.name);
  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500 ? err.message : "Internal Server Error",
  });
});

// Connect to MongoDB Atlas (or local fallback) and start server
const startServer = async () => {
  try {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === "your_jwt_secret_key_here"
    )
      throw new Error("Configure JWT_SECRET in server/.env.");
    await connectDB();
    if (
      process.env.SEED_DEMO === "true" &&
      process.env.NODE_ENV !== "production"
    )
      await seedDatabase();

    app.listen(PORT, () => {
      console.log(`UniSphere server running on port ${PORT}`);
      console.log(`Accepting requests from ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") startServer();

export default app;
