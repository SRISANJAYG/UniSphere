import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import {
  BookOpen,
  FileCheck2,
  Calendar,
  Sparkles,
  Users,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [courseRes, assignRes, eventRes, postRes] =
          await Promise.allSettled([
            API.get("/api/courses"),
            API.get("/api/assignments"),
            API.get("/api/events?type=upcoming"),
            API.get("/api/posts/feed?limit=3"),
          ]);

        if (courseRes.status === "fulfilled" && courseRes.value.data.success) {
          setCourses(courseRes.value.data.courses || []);
        }
        if (assignRes.status === "fulfilled" && assignRes.value.data.success) {
          setAssignments(assignRes.value.data.assignments || []);
        }
        if (eventRes.status === "fulfilled" && eventRes.value.data.success) {
          setEvents(eventRes.value.data.events || []);
        }
        if (postRes.status === "fulfilled" && postRes.value.data.success) {
          setRecentPosts(postRes.value.data.posts || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const enrolledCourses = courses.filter((c) =>
    c.enrolledStudents?.some((s) => s === user?._id || s._id === user?._id),
  );

  const pendingAssignments = assignments.filter(
    (a) =>
      !a.isSubmitted && enrolledCourses.some((c) => c._id === a.course?._id),
  );

  const nextAssignment = [...pendingAssignments].filter(item=>new Date(item.dueDate)>=new Date()).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate))[0];
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const todayCourses = enrolledCourses.filter(course=>course.schedule?.toLowerCase().includes(weekday.toLowerCase()));
  const nextEvent = [...events].filter(item=>new Date(item.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];

  return (
    <div className="observatory-dashboard flex flex-col gap-10 pb-16 animate-fadeIn">
      <header className="observatory-welcome">
        <div><p className="observatory-eyebrow">YOUR CAMPUS, IN FOCUS</p><h1>Welcome back, {user?.name?.split(' ')[0]}.</h1><p className="observatory-description">A little clarity for the day ahead.</p></div>
        <Link to="/feed" className="btn-secondary text-xs"><PlusCircle size={15}/> Share an update</Link>
      </header>
      <section className="observatory-priorities" aria-label="Your academic priorities">
        <Link to="/assignments" className="priority-card priority-assignment"><div className="priority-label"><FileCheck2 size={17}/><span>NEXT ASSIGNMENT</span><ArrowRight size={15}/></div><h2>{loading?'Loading…':nextAssignment?.title||'A little breathing room.'}</h2><p>{loading?'Checking your deadlines':nextAssignment?new Date(nextAssignment.dueDate).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'No upcoming assignments in your enrolled courses.'}</p><div className="priority-footer">{pendingAssignments.length} pending <span>View assignments ↗</span></div></Link>
        <Link to="/courses" className="priority-card"><div className="priority-label"><BookOpen size={17}/><span>TODAY’S CLASSES</span><ArrowRight size={15}/></div><h2>{loading?'Loading…':todayCourses[0]?.title||'Time for independent study.'}</h2><p>{loading?'Checking your courses':todayCourses[0]?.schedule||'No enrolled classes scheduled for today.'}</p><div className="priority-footer">{todayCourses.length} scheduled <span>Open courses ↗</span></div></Link>
        <Link to="/events" className="priority-card"><div className="priority-label"><Calendar size={17}/><span>ON THE HORIZON</span><ArrowRight size={15}/></div><h2>{loading?'Loading…':nextEvent?.title||'Something new is ahead.'}</h2><p>{loading?'Checking campus events':nextEvent?new Date(nextEvent.date).toLocaleDateString([], {month:'short',day:'numeric'})+' · '+nextEvent.venue:'Explore campus events when you’re ready.'}</p><div className="priority-footer">Campus calendar <span>Discover events ↗</span></div></Link>
      </section>

      {/* 2. Main 2-Column Academic & Community Layout with Generous Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols): Courses & Assignments */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* My Courses Section */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  My Academic Courses
                </h3>
              </div>
              <Link
                to="/courses"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold text-decoration-none transition-colors"
              >
                View Catalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="glass-card p-10 text-center text-slate-400 text-sm">
                Loading course registrations...
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl text-center">
                <p className="text-sm text-slate-400 mb-4">
                  You are not yet enrolled in any courses for this semester.
                </p>
                <Link
                  to="/courses"
                  className="btn-secondary text-xs"
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  Browse Courses to Enroll
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {enrolledCourses.map((course) => (
                  <div
                    key={course._id}
                    className="glass-card p-6 flex flex-col justify-between gap-5 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-indigo text-[10px]">
                          {course.code}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {course.credits} Credits
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                      <span>Prof: {course.instructor}</span>
                      <Link
                        to={`/courses`}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-decoration-none flex items-center gap-1 transition-colors"
                      >
                        Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Assignments Checklist */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Assignments & Submissions
                </h3>
              </div>
              <Link
                to="/assignments"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold text-decoration-none transition-colors"
              >
                All Assignments <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 text-sm">
                No assignments scheduled currently.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {assignments.slice(0, 4).map((assign) => (
                  <div
                    key={assign._id}
                    className="glass-card p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          assign.isSubmitted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {assign.isSubmitted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="badge badge-indigo text-[9px]">
                            {assign.course?.code}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {assign.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Due:{" "}
                          {new Date(assign.dueDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          • Max {assign.maxPoints} pts
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/assignments`}
                      className={`text-xs font-bold px-4 py-2 rounded-full text-decoration-none transition-all ${
                        assign.isSubmitted
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "btn-primary"
                      }`}
                    >
                      {assign.isSubmitted ? "Submitted" : "Submit"}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1 Col): Events & Community Feed Buzz */}
        <div className="flex flex-col gap-10">
          {/* Upcoming Campus Events */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Campus Events
                </h3>
              </div>
              <Link
                to="/events"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold text-decoration-none transition-colors"
              >
                Calendar <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              {events.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 text-sm">
                  No upcoming events scheduled.
                </div>
              ) : (
                events.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="glass-card p-5 flex flex-col gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="badge badge-fuchsia text-[9px]">
                        {event.category}
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {event.isPaid ? `₹${event.fee}` : "Free"}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white leading-snug group-hover:text-pink-300 transition-colors">
                      {event.title}
                    </h5>
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Campus Feed Activity */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Campus Buzz
                </h3>
              </div>
              <Link
                to="/feed"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold text-decoration-none transition-colors"
              >
                Go to Feed <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              {recentPosts.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 text-sm">
                  No posts yet on feed.
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post._id}
                    className="glass-card p-4 flex gap-3.5 text-xs group"
                  >
                    <img
                      src={
                        post.author?.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username || "peer"}`
                      }
                      alt={post.author?.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {post.author?.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
