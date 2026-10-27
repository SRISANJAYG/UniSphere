import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Technology", "Cultural", "Robotics", "Arts", "Sports", "Debate"],
      default: "Technology",
    },
    lead: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
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

const Club = mongoose.model("Club", clubSchema);
export default Club;
