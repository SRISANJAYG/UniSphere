import Notification from "../models/notification.model.js";

// 1. GET ALL NOTIFICATIONS FOR LOGGED IN USER
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

// 2. MARK NOTIFICATION AS READ
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

// 3. MARK ALL AS READ
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark all as read.",
      error: error.message,
    });
  }
};
