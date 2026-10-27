import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/payment.model.js";
import Event from "../models/event.model.js";
import Notification from "../models/notification.model.js";

// Helper to get Razorpay instance if configured
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId?.startsWith("rzp_test_") ||
    !keySecret ||
    keyId.includes("your_key_id") ||
    keySecret.includes("your_razorpay_secret")
  ) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// 1. GET PUBLIC RAZORPAY KEY ID (Frontend needs key_id for Checkout modal, NEVER secret)
export const getRazorpayKey = (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured =
    Boolean(keyId?.startsWith("rzp_test_")) &&
    !keyId.includes("your_key_id") &&
    Boolean(process.env.RAZORPAY_KEY_SECRET) &&
    !process.env.RAZORPAY_KEY_SECRET.includes("your_razorpay_secret");

  return res.status(200).json({
    success: true,
    isConfigured,
    keyId: isConfigured ? keyId : null,
    message: isConfigured
      ? "Razorpay is configured in test mode."
      : "Razorpay credentials are not configured or using placeholders in server/.env.",
  });
};

// 2. CREATE PAYMENT ORDER
export const createPaymentOrder = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required for checkout.",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Check if already registered
    const isAlreadyRegistered = event.attendees.some(
      (a) =>
        a.student.toString() === userId.toString() &&
        a.paymentStatus === "Paid",
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You have already registered and paid for this event.",
      });
    }

    if (event.date < new Date() || event.attendees.length >= event.capacity)
      return res
        .status(409)
        .json({ success: false, message: "Event is past or full." });
    const amountInPaise = Math.round(event.fee * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "This event does not require payment.",
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(400).json({
        success: false,
        configured: false,
        message:
          "Razorpay test credentials are not configured in server/.env. Please provide valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const receipt = `rcpt_${Date.now()}_${userId.toString().slice(-4)}`;

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        eventId: event._id.toString(),
        userId: userId.toString(),
        eventTitle: event.title,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save initial payment record
    await Payment.create({
      user: userId,
      event: event._id,
      razorpayOrderId: order.id,
      amount: event.fee,
      currency: "INR",
      status: "created",
      receipt,
    });

    return res.status(200).json({
      success: true,
      order,
      event: {
        id: event._id,
        title: event.title,
        fee: event.fee,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Razorpay checkout.",
      error: error.message,
    });
  }
};

// 3. VERIFY PAYMENT SIGNATURE & CONFIRM REGISTRATION
export const verifyPaymentSignature = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
    } = req.body;
    const userId = req.user._id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "Server Razorpay secret is not configured.",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
      event: eventId,
    });
    if (!payment)
      return res
        .status(404)
        .json({
          success: false,
          message: "Payment order not found for this account and event.",
        });
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (
      !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
      !crypto.timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(razorpay_signature, "hex"),
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    const razorpay = getRazorpayInstance();
    if (!razorpay)
      return res
        .status(503)
        .json({
          success: false,
          message: "Configure Razorpay test credentials.",
        });
    const remote = await razorpay.payments.fetch(razorpay_payment_id);
    if (
      remote.order_id !== razorpay_order_id ||
      remote.amount !== Math.round(payment.amount * 100) ||
      remote.currency !== payment.currency ||
      remote.status !== "captured"
    )
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Payment is pending capture or does not match this order. Please check again later.",
        });
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    await Event.updateOne(
      { _id: eventId, "attendees.student": { $ne: userId } },
      {
        $push: {
          attendees: {
            student: userId,
            registeredAt: new Date(),
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
          },
        },
      },
    );
    if (payment.status === "verified")
      return res.json({
        success: true,
        message: "Payment already verified.",
        payment,
        eventTitle: event.title,
      });
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "verified";
    await payment.save();

    // Create notification
    await Notification.create({
      recipient: userId,
      type: "payment",
      message: `Payment of ₹${payment ? payment.amount : event.fee} verified! You are officially registered for "${event.title}".`,
      relatedId: event._id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully and registration confirmed!",
      payment,
      eventTitle: event.title,
    });
  } catch (error) {
    console.error("Verify Signature Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification.",
      error: error.message,
    });
  }
};

// 4. GET STUDENT PAYMENT HISTORY
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("event", "title date time venue")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history.",
      error: error.message,
    });
  }
};
