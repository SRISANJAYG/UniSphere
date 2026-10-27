import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import {
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

const RazorpayModal = ({ isOpen, onClose, event, onPaymentSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [keyConfig, setKeyConfig] = useState({
    isConfigured: false,
    keyId: null,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Check if Razorpay keys are configured on backend
    const checkRazorpayKey = async () => {
      try {
        const res = await API.get("/api/payments/key");
        if (res.data.success) {
          setKeyConfig({
            isConfigured: res.data.isConfigured,
            keyId: res.data.keyId,
          });
        }
      } catch (err) {
        setErrorMsg("Failed to verify payment gateway status.");
      }
    };

    checkRazorpayKey();
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handlePayNow = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Create Order on backend
      const orderRes = await API.post("/api/payments/order", {
        eventId: event._id,
      });
      if (!orderRes.data.success) {
        setErrorMsg(orderRes.data.message || "Failed to create payment order.");
        setLoading(false);
        return;
      }

      const { order } = orderRes.data;

      // 2. Check if Razorpay script is loaded in window
      if (typeof window.Razorpay === "undefined") {
        setErrorMsg(
          "Razorpay Checkout SDK not loaded. Please verify your internet connection.",
        );
        setLoading(false);
        return;
      }

      // 3. Configure Razorpay Checkout options
      const options = {
        key: keyConfig.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "UniSphere Campus Portal",
        description: `Registration Fee: ${event.title}`,
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=unisphere",
        order_id: order.id,
        prefill: {
          name: user?.name || "Student",
          email: user?.email || "",
          contact: "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            addToast("Payment window closed by user.", "info");
          },
        },
        // 4. Handler for payment response: Forward signature to server for verification
        handler: async function (response) {
          try {
            const verifyRes = await API.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event._id,
            });

            if (verifyRes.data.success) {
              addToast(
                verifyRes.data.message || "Payment verified & registered!",
                "success",
              );
              onClose();
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data.payment);
            } else {
              setErrorMsg(
                verifyRes.data.message || "Payment verification failed.",
              );
            }
          } catch (err) {
            setErrorMsg(
              err.response?.data?.message ||
                "Server verification error. Please contact support.",
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        setLoading(false);
        setErrorMsg(`Payment failed: ${response.error.description}`);
        addToast(`Payment failed: ${response.error.description}`, "error");
      });

      razorpayInstance.open();
    } catch (err) {
      setLoading(false);
      setErrorMsg(
        err.response?.data?.message || "Checkout initialization error.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 shadow-2xl relative border border-indigo-500/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Event Registration Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 mb-4 flex flex-col gap-2">
          <span className="badge badge-indigo text-[10px] w-fit">
            {event.category}
          </span>
          <h4 className="text-base font-bold text-white">{event.title}</h4>
          <p className="text-xs text-slate-400">
            {new Date(event.date).toLocaleDateString()} • {event.venue}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
            <span className="text-xs text-slate-400">Registration Fee:</span>
            <span className="text-xl font-extrabold text-white">
              ₹{event.fee}
            </span>
          </div>
        </div>

        {/* Gateway Status / Warning */}
        {!keyConfig.isConfigured ? (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex gap-2.5 items-start mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Razorpay Test Gateway Pending</p>
              <p className="text-amber-300/80 mt-0.5 text-[11px] leading-relaxed">
                Add your Razorpay test-mode key and secret in{" "}
                <code>server/.env</code> (<code>RAZORPAY_KEY_ID</code> and{" "}
                <code>RAZORPAY_KEY_SECRET</code>) to activate live test
                checkouts.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex gap-2 items-center mb-4">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Secure 256-bit encrypted Razorpay Test Checkout</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
            style={{ padding: "0.5rem 1rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={loading || !keyConfig.isConfigured}
            className="btn-primary text-xs"
            style={{ padding: "0.5rem 1.25rem" }}
          >
            {loading ? "Processing..." : `Pay ₹${event.fee} & Register`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
