import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";
import Notification from "../models/notification.model.js";

// 1. GET ALL ASSIGNMENTS
export const getAssignments = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    let query = {};

    if (courseId) {
      query.course = courseId;
    }

    if (req.query.dueBefore) {
      const end = new Date(req.query.dueBefore + "T23:59:59.999Z");
      if (!Number.isFinite(end.getTime()))
        return res
          .status(400)
          .json({ success: false, message: "Invalid date filter." });
      query.dueDate = { $lte: end };
    }
    const assignments = await Assignment.find(query)
      .populate("course", "code title department")
      .populate("submissions.student", "name username avatar")
      .sort({ dueDate: 1 });

    const userId = req.user ? req.user._id.toString() : null;

    // Attach student status (e.g. submitted / pending)
    const formatted = assignments.map((assign) => {
      const plain = assign.toObject();
      const mySub = plain.submissions.find(
        (s) => s.student?._id?.toString() === userId,
      );
      if (req.user.role === "student")
        plain.submissions = plain.submissions.filter(
          (sub) => sub.student?._id?.toString() === userId,
        );
      plain.mySubmission = mySub || null;
      plain.isSubmitted = !!mySub;
      return plain;
    });

    let result = formatted;
    if (status === "submitted") {
      result = formatted.filter((a) => a.isSubmitted);
    } else if (status === "pending") {
      result = formatted.filter((a) => !a.isSubmitted);
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      assignments: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments.",
      error: error.message,
    });
  }
};

// 2. GET SINGLE ASSIGNMENT
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "code title department instructor")
      .populate("submissions.student", "name username avatar department year");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const plain = assignment.toObject();
    const userId = req.user._id.toString();
    plain.mySubmission =
      plain.submissions.find((s) => s.student?._id?.toString() === userId) ||
      null;

    if (req.user.role === "student")
      plain.submissions = plain.submissions.filter(
        (sub) => sub.student?._id?.toString() === userId,
      );
    return res.status(200).json({
      success: true,
      assignment: plain,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment.",
      error: error.message,
    });
  }
};

// 3. CREATE ASSIGNMENT (Staff/Admin)
export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, maxPoints } = req.body;

    if (!courseId || !title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Course, title, description, and due date are required.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const newAssignment = await Assignment.create({
      course: courseId,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      maxPoints: maxPoints || 100,
      createdBy: req.user._id,
    });

    await newAssignment.populate("course", "code title");

    // Notify enrolled students
    for (const studentId of course.enrolledStudents) {
      await Notification.create({
        recipient: studentId,
        type: "assignment",
        message: `New assignment posted in ${course.code}: "${title}" (Due: ${new Date(dueDate).toLocaleDateString()})`,
        relatedId: newAssignment._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully!",
      assignment: newAssignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create assignment.",
      error: error.message,
    });
  }
};

// 4. SUBMIT ASSIGNMENT
export const submitAssignment = async (req, res) => {
  try {
    const { submissionText, attachmentUrl } = req.body;
    const assignmentId = req.params.id;
    const userId = req.user._id;

    if (!submissionText && !attachmentUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide submission text notes or a project attachment/URL link.",
      });
    }

    const assignment = await Assignment.findById(assignmentId).populate(
      "course",
      "code title",
    );
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }

    const existingSubIndex = assignment.submissions.findIndex(
      (s) => s.student.toString() === userId.toString(),
    );

    if (existingSubIndex > -1) {
      // Re-submit / update submission
      assignment.submissions[existingSubIndex].submissionText =
        submissionText ||
        assignment.submissions[existingSubIndex].submissionText;
      assignment.submissions[existingSubIndex].attachmentUrl =
        attachmentUrl || assignment.submissions[existingSubIndex].attachmentUrl;
      assignment.submissions[existingSubIndex].submittedAt = new Date();
      assignment.submissions[existingSubIndex].status = "Submitted";
    } else {
      // New submission
      assignment.submissions.push({
        student: userId,
        submissionText: submissionText || "",
        attachmentUrl: attachmentUrl || "",
        submittedAt: new Date(),
        status: "Submitted",
      });
    }

    await assignment.save();

    await Notification.create({
      recipient: userId,
      type: "assignment",
      message: `Assignment "${assignment.title}" submitted successfully!`,
      relatedId: assignment._id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment.",
      error: error.message,
    });
  }
};

// 5. GRADE SUBMISSION (Staff/Admin)
export const gradeSubmission = async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }

    const sub = assignment.submissions.find(
      (s) => s.student.toString() === studentId,
    );
    if (!sub) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Submission not found for this student.",
        });
    }

    if (
      !Number.isFinite(Number(grade)) ||
      Number(grade) < 0 ||
      Number(grade) > assignment.maxPoints
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Grade must be between zero and the maximum points.",
        });
    sub.grade = Number(grade);
    sub.feedback = feedback || "";
    sub.status = "Graded";

    await assignment.save();

    await Notification.create({
      recipient: studentId,
      type: "assignment",
      message: `Your submission for "${assignment.title}" was graded: ${grade}/${assignment.maxPoints}`,
      relatedId: assignment._id,
    });

    return res.status(200).json({
      success: true,
      message: "Graded successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to grade submission.",
      error: error.message,
    });
  }
};
