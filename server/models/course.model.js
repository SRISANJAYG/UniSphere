import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Computer Science & Engineering",
    },
    instructor: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      default: 4,
    },
    schedule: {
      type: String,
      default: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
    },
    room: {
      type: String,
      default: "LH-204",
    },
    syllabus: [
      {
        type: String,
      },
    ],
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: "Document" },
      },
    ],
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
