import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ["Free", "Paid", "Pending"],
    default: "Free",
  },
  paymentId: {
    type: String,
    default: "",
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Hackathon", "Workshop", "Cultural", "Sports", "Seminar", "Tech Fest"],
      default: "Tech Fest",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    organizer: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 200,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      default: 0,
    },
    attendees: [attendeeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
