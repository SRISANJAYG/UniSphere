import { literalSearch } from "../utils/search.js";
import Club from "../models/club.model.js";
import Notification from "../models/notification.model.js";

// 1. GET ALL CLUBS
export const getAllClubs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: literalSearch(search), $options: "i" } },
        { description: { $regex: literalSearch(search), $options: "i" } },
        { lead: { $regex: literalSearch(search), $options: "i" } },
      ];
    }

    const clubs = await Club.find(query).sort({ name: 1 });
    const userId = req.user ? req.user._id.toString() : null;

    const formatted = clubs.map((club) => {
      const plain = club.toObject();
      plain.isMember = plain.members.some((m) => m.toString() === userId);
      plain.membersCount = plain.members.length;
      return plain;
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      clubs: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clubs.",
      error: error.message,
    });
  }
};

// 2. GET SINGLE CLUB
export const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("members", "name username avatar department year")
      .populate("createdBy", "name username");

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found.",
      });
    }

    const plain = club.toObject();
    const userId = req.user ? req.user._id.toString() : null;
    plain.isMember = plain.members.some(
      (m) => m._id?.toString() === userId || m.toString() === userId,
    );
    plain.membersCount = plain.members.length;

    return res.status(200).json({
      success: true,
      club: plain,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch club details.",
      error: error.message,
    });
  }
};

// 3. JOIN / LEAVE CLUB
export const joinLeaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res
        .status(404)
        .json({ success: false, message: "Club not found." });
    }

    const userId = req.user._id;
    const isMember = club.members.includes(userId);

    if (isMember) {
      club.members.pull(userId);
      await club.save();
      return res.status(200).json({
        success: true,
        isMember: false,
        message: `Left ${club.name}.`,
        membersCount: club.members.length,
      });
    } else {
      club.members.push(userId);
      await club.save();

      await Notification.create({
        recipient: userId,
        type: "announcement",
        message: `Welcome to ${club.name}! You are now an active club member.`,
        relatedId: club._id,
      });

      return res.status(200).json({
        success: true,
        isMember: true,
        message: `Joined ${club.name}! Welcome aboard.`,
        membersCount: club.members.length,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Club membership action failed.",
      error: error.message,
    });
  }
};

// 4. CREATE CLUB
export const createClub = async (req, res) => {
  try {
    const { name, tagline, description, category, lead, email, logo } =
      req.body;

    if (!name || !description || !lead) {
      return res.status(400).json({
        success: false,
        message: "Club name, description, and club lead name are required.",
      });
    }

    const existing = await Club.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A club named "${name}" already exists.`,
      });
    }

    const newClub = await Club.create({
      name: name.trim(),
      tagline: tagline ? tagline.trim() : "",
      description: description.trim(),
      category: category || "Technology",
      lead: lead.trim(),
      email: email ? email.trim() : "",
      logo: logo || "",
      members: [req.user._id],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Student club created successfully!",
      club: newClub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create club.",
      error: error.message,
    });
  }
};

// 5. ADD CLUB ANNOUNCEMENT
export const addClubAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and announcement content are required.",
      });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res
        .status(404)
        .json({ success: false, message: "Club not found." });
    }

    if (
      club.createdBy.toString() !== req.user._id.toString() &&
      !["faculty", "admin"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Only the club creator or faculty can publish announcements.",
        });
    }
    club.announcements.unshift({
      title: title.trim(),
      content: content.trim(),
      date: new Date(),
    });
    await club.save();

    // Notify club members
    for (const memberId of club.members) {
      if (memberId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: memberId,
          type: "announcement",
          message: `${club.name} announcement: "${title}"`,
          relatedId: club._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Club announcement broadcasted!",
      announcements: club.announcements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to post announcement.",
      error: error.message,
    });
  }
};
