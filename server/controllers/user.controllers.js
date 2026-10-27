import { literalSearch } from "../utils/search.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// 1. REGISTER
export const register = async (req, res) => {
  try {
    const { name, username, email, password, department, course, year } =
      req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email, and password are required.",
      });
    }

    if (
      ![name, username, email, password].every(
        (value) => typeof value === "string",
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Registration fields must be text." });
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[a-zA-Z0-9_]{3,30}$/.test(username)
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Use a valid email and a username of 3–30 letters, numbers or underscores.",
        });
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      department: department || "Computer Science & Engineering",
      course: course || "B.Tech Computer Science",
      year: year || "1st Year",
      studentId: `UNI-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    });

    const token = generateToken(newUser._id);
    res.cookie("token", token, cookieOptions);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// 2. LOGIN
export const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required.",
      });
    }

    if (typeof loginIdentifier !== "string" || typeof password !== "string")
      return res
        .status(400)
        .json({ success: false, message: "Enter your email and password." });
    const cleanId = loginIdentifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// 3. LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// 4. GET CURRENT AUTH USER PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "name username avatar department")
      .populate("following", "name username avatar department");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

// 5. UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, department, course, year, skills, interests, avatar } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (department) user.department = department;
    if (course) user.course = course;
    if (year) user.year = year;
    if (avatar) user.avatar = avatar;

    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (interests) {
      user.interests = Array.isArray(interests)
        ? interests
        : interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);
    }

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// 6. GET ALL STUDENTS & SEARCH
export const getStudents = async (req, res) => {
  try {
    const { search, department, year } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: literalSearch(search), $options: "i" } },
        { username: { $regex: literalSearch(search), $options: "i" } },
        { department: { $regex: literalSearch(search), $options: "i" } },
        { skills: { $in: [new RegExp(literalSearch(search), "i")] } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (year) {
      query.year = year;
    }

    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
      error: error.message,
    });
  }
};

// 7. GET STUDENT BY ID OR USERNAME
export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const user = isObjectId
      ? await User.findById(id).select("-password")
      : await User.findOne({ username: id.toLowerCase() }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    await user.populate("followers", "name username avatar department");
    await user.populate("following", "name username avatar department");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile.",
      error: error.message,
    });
  }
};

// 8. FOLLOW / UNFOLLOW STUDENT
export const followUnfollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        isFollowing: false,
        message: `Unfollowed @${targetUser.username}`,
      });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Create notification
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: "follow",
        message: `@${currentUser.username} started following you.`,
        relatedId: currentUserId,
      });

      return res.status(200).json({
        success: true,
        isFollowing: true,
        message: `Now following @${targetUser.username}!`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Follow/Unfollow action failed.",
      error: error.message,
    });
  }
};
