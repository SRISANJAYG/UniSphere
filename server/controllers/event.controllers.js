import { literalSearch } from "../utils/search.js";
import Event from "../models/event.model.js";
import Notification from "../models/notification.model.js";

// 1. GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const { category, type, search } = req.query; // type: "upcoming" | "past" | "all"
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: literalSearch(search), $options: "i" } },
        { organizer: { $regex: literalSearch(search), $options: "i" } },
        { venue: { $regex: literalSearch(search), $options: "i" } },
      ];
    }

    const now = new Date();
    if (type === "upcoming") {
      query.date = { $gte: now };
    } else if (type === "past") {
      query.date = { $lt: now };
    }

    const events = await Event.find(query)
      .populate("attendees.student", "name username avatar department")
      .sort({ date: 1 });

    const userId = req.user ? req.user._id.toString() : null;

    const formatted = events.map((ev) => {
      const plain = ev.toObject();
      plain.isRegistered = plain.attendees.some(
        (a) =>
          a.student?._id?.toString() === userId ||
          a.student?.toString() === userId,
      );
      plain.attendeesCount = plain.attendees.length;
      return plain;
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      events: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
};

// 2. GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("attendees.student", "name username avatar department year")
      .populate("createdBy", "name username");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const plain = event.toObject();
    const userId = req.user._id.toString();
    plain.isRegistered = plain.attendees.some(
      (a) =>
        a.student?._id?.toString() === userId ||
        a.student?.toString() === userId,
    );
    plain.attendeesCount = plain.attendees.length;

    return res.status(200).json({
      success: true,
      event: plain,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
      error: error.message,
    });
  }
};

// 3. CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      organizer,
      banner,
      capacity,
      isPaid,
      fee,
    } = req.body;

    if (!title || !description || !date || !time || !venue || !organizer) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, date, time, venue, and organizer are required.",
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Tech Fest",
      date: new Date(date),
      time: time.trim(),
      venue: venue.trim(),
      organizer: organizer.trim(),
      banner: banner || "",
      capacity: capacity || 200,
      isPaid: Boolean(isPaid),
      fee: isPaid ? Number(fee) : 0,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Campus event published successfully!",
      event: newEvent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
      error: error.message,
    });
  }
};

// 4. REGISTER FOR EVENT (Free event registration)
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    }

    if(event.date < new Date()) return res.status(400).json({success:false,message:'Registration for this event has closed.'});
    const userId = req.user._id;
    const isAlreadyRegistered = event.attendees.some(
      (a) => a.student.toString() === userId.toString(),
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event.",
      });
    }

    if (event.isPaid && event.fee > 0) {
      return res.status(400).json({
        success: false,
        message: "This is a paid event. Please complete checkout to register.",
      });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "This event is at maximum capacity.",
      });
    }

    event.attendees.push({
      student: userId,
      registeredAt: new Date(),
      paymentStatus: "Free",
    });

    await event.save();

    await Notification.create({
      recipient: userId,
      type: "event",
      message: `Registration confirmed for "${event.title}" on ${new Date(event.date).toLocaleDateString()}!`,
      relatedId: event._id,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully registered for "${event.title}"!`,
      attendeesCount: event.attendees.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register for event.",
      error: error.message,
    });
  }
};
