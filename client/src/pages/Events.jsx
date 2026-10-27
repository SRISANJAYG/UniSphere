import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api/axios";
import RazorpayModal from "../components/RazorpayModal";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Search,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react";

const Events = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("upcoming"); // "upcoming" | "past" | "all"
  const [search, setSearch] = useState("");

  // Payment checkout modal state
  const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

  // New event creation modal (staff / admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "Hackathon",
    date: "",
    time: "",
    venue: "",
    organizer: "",
    banner: "",
    capacity: 200,
    isPaid: false,
    fee: 0,
  });

  const categories = [
    "All",
    "Hackathon",
    "Workshop",
    "Tech Fest",
    "Cultural",
    "Sports",
    "Seminar",
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `/api/events?type=${timeFilter}&`;
      if (categoryFilter !== "All") url += `category=${categoryFilter}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await API.get(url);
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      addToast("Failed to fetch events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, timeFilter]);

  const handleFreeRegistration = async (eventId, title) => {
    try {
      const res = await API.post(`/api/events/${eventId}/register`);
      if (res.data.success) {
        addToast(res.data.message || `Registered for ${title}!`, "success");
        fetchEvents();
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Registration failed", "error");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/events", newEvent);
      if (res.data.success) {
        addToast("Event published to campus calendar!", "success");
        setShowCreateModal(false);
        fetchEvents();
        setNewEvent({
          title: "",
          description: "",
          category: "Hackathon",
          date: "",
          time: "",
          venue: "",
          organizer: "",
          banner: "",
          capacity: 200,
          isPaid: false,
          fee: 0,
        });
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create event",
        "error",
      );
    }
  };

  const isStaff = user?.role === "faculty" || user?.role === "admin";

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchEvents();
        }}
        className="flex gap-3"
      >
        <input
          aria-label="Search events"
          className="input-field"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Campus Activities</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Campus Events & Hackathons
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover upcoming hackathons, tech workshops, cultural festivals,
            and register
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setTimeFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
                timeFilter === "upcoming"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter("past")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all border-0 cursor-pointer ${
                timeFilter === "past"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              Past Events
            </button>
          </div>

          {isStaff && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs"
              style={{ padding: "0.55rem 1rem" }}
            >
              <PlusCircle className="w-4 h-4" />
              Publish Event
            </button>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="glass-card p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 text-sm">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Event Banner */}
              {event.banner && (
                <div className="h-44 w-full overflow-hidden bg-black/40 relative">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-indigo text-[10px] bg-black/60 backdrop-blur-md">
                      {event.isPaid ? `Entry ₹${event.fee}` : "Free Pass"}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-fuchsia text-[9px]">
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Org: {event.organizer}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {event.title}
                  </h3>
                  <details className="text-xs text-slate-400 mt-2 leading-relaxed"><summary className="cursor-pointer text-sky-200">Read event details</summary><p className="mt-2 whitespace-pre-wrap">{event.description}</p></details>

                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>
                        {new Date(event.date).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action: Register or Razorpay Checkout */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {event.attendeesCount} / {event.capacity} attending
                  </span>

                  {new Date(event.date)<new Date() ? <span className="text-xs text-slate-400">Registration closed</span> : event.isRegistered ? (
                    <span className="badge badge-emerald text-[10px] py-1.5 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered ✓
                    </span>
                  ) : event.isPaid ? (
                    <button
                      onClick={() => setSelectedEventForPayment(event)}
                      className="btn-primary text-xs"
                      style={{ padding: "0.45rem 1rem" }}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Register (₹{event.fee})
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleFreeRegistration(event._id, event.title)
                      }
                      className="btn-primary text-xs"
                      style={{ padding: "0.45rem 1rem" }}
                    >
                      Register Free
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Razorpay Test-Mode Checkout Modal */}
      <RazorpayModal
        isOpen={Boolean(selectedEventForPayment)}
        onClose={() => setSelectedEventForPayment(null)}
        event={selectedEventForPayment}
        onPaymentSuccess={() => fetchEvents()}
      />

      {/* Staff Publish Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl relative border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                Publish Campus Event
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Hackfest 2026"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value })
                    }
                    className="input-field text-xs"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="bg-slate-900 text-white"
                        >
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coding Society"
                    value={newEvent.organizer}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, organizer: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 4:00 PM"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Innovation Hall / Auditorium"
                  value={newEvent.venue}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, venue: e.target.value })
                  }
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newEvent.banner}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, banner: e.target.value })
                  }
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Event itinerary, prizes, requirements..."
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="input-field text-xs min-h-[70px]"
                  required
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvent.isPaid}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, isPaid: e.target.checked })
                    }
                  />
                  <span>Paid Event (Razorpay Test Gateway)</span>
                </label>

                {newEvent.isPaid && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Fee (₹):</span>
                    <input
                      type="number"
                      value={newEvent.fee}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          fee: Number(e.target.value),
                        })
                      }
                      className="input-field text-xs w-24"
                      min="1"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Publish to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
