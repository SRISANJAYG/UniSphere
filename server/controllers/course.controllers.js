import { literalSearch } from "../utils/search.js";
import Course from "../models/course.model.js";
import Notification from "../models/notification.model.js";

// 1. GET ALL COURSES
export const getAllCourses = async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: literalSearch(search), $options: "i" } },
        { code: { $regex: literalSearch(search), $options: "i" } },
        { instructor: { $regex: literalSearch(search), $options: "i" } },
      ];
    }

    if (department && department !== "All") {
      query.department = department;
    }

    const courses = await Course.find(query)
      .populate("instructor")
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses.",
      error: error.message,
    });
  }
};

// 2. GET COURSE BY ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("enrolledStudents", "name username avatar department year")
      .populate("createdBy", "name username");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details.",
      error: error.message,
    });
  }
};

// 3. ENROLL / UNENROLL IN COURSE
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const userId = req.user._id;
    const isEnrolled = course.enrolledStudents.includes(userId);

    if (isEnrolled) {
      course.enrolledStudents.pull(userId);
      await course.save();
      return res.status(200).json({
        success: true,
        enrolled: false,
        message: `Unenrolled from ${course.code} - ${course.title}.`,
      });
    } else {
      course.enrolledStudents.push(userId);
      await course.save();

      await Notification.create({
        recipient: userId,
        type: "announcement",
        message: `You successfully enrolled in ${course.code} - ${course.title}!`,
        relatedId: course._id,
      });

      return res.status(200).json({
        success: true,
        enrolled: true,
        message: `Successfully enrolled in ${course.code} - ${course.title}!`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Enrollment toggle failed.",
      error: error.message,
    });
  }
};

// 4. CREATE COURSE (Staff/Admin)
export const createCourse = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      department,
      instructor,
      credits,
      schedule,
      room,
      syllabus,
    } = req.body;

    if (!code || !title || !description || !instructor) {
      return res.status(400).json({
        success: false,
        message:
          "Course code, title, description, and instructor are required.",
      });
    }

    const existingCourse = await Course.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: `Course with code ${code.toUpperCase()} already exists.`,
      });
    }

    const newCourse = await Course.create({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      department: department || "Computer Science & Engineering",
      instructor: instructor.trim(),
      credits: credits || 4,
      schedule: schedule || "Mon, Wed, Fri 10:00 AM",
      room: room || "LH-101",
      syllabus: Array.isArray(syllabus)
        ? syllabus
        : syllabus
          ? syllabus.split("\n")
          : [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully!",
      course: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create course.",
      error: error.message,
    });
  }
};

// 5. ADD COURSE ANNOUNCEMENT
export const addCourseAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and announcement content are required.",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    course.announcements.unshift({
      title: title.trim(),
      content: content.trim(),
      date: new Date(),
    });
    await course.save();

    // Notify enrolled students
    for (const studentId of course.enrolledStudents) {
      await Notification.create({
        recipient: studentId,
        type: "announcement",
        message: `New announcement in ${course.code}: "${title}"`,
        relatedId: course._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course announcement posted!",
      announcements: course.announcements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to post announcement.",
      error: error.message,
    });
  }
};

// 6. ADD RESOURCE
export const addCourseResource = async (req, res) => {
  try {
    const { title, url, type } = req.body;
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Resource title and URL are required.",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    course.resources.push({
      title: title.trim(),
      url: url.trim(),
      type: type || "Document",
    });
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Resource added successfully!",
      resources: course.resources,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add resource.",
      error: error.message,
    });
  }
};
