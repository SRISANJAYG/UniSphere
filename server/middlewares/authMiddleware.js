import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session expired or user not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

export const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "faculty" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access forbidden. Faculty or Admin privileges required.",
  });
};
