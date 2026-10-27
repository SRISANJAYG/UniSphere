import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Passionate university student exploring tech, design, and innovation.",
    },
    department: {
      type: String,
      default: "Computer Science & Engineering",
    },
    course: {
      type: String,
      default: "B.Tech Computer Science",
    },
    year: {
      type: String,
      default: "3rd Year",
    },
    studentId: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: ["JavaScript", "React", "Node.js", "Python"],
    },
    interests: {
      type: [String],
      default: ["Web Development", "AI & ML", "Open Source", "Hackathons"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
