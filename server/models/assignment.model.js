import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  submissionText: {
    type: String,
    default: "",
  },
  attachmentUrl: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Submitted", "Graded", "Pending"],
    default: "Submitted",
  },
  grade: {
    type: Number,
  },
  feedback: {
    type: String,
    default: "",
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
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
    dueDate: {
      type: Date,
      required: true,
    },
    maxPoints: {
      type: Number,
      default: 100,
    },
    submissions: [submissionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
