import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Event from "../models/event.model.js";
import Club from "../models/club.model.js";
import Post from "../models/post.model.js";
import Assignment from "../models/assignment.model.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already initialized with records.");
      return;
    }

    console.log(
      "Seeding DEMO FIXTURES. This is sample activity, not live student data.",
    );

    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash(process.env.DEMO_PASSWORD || crypto.randomBytes(24).toString("base64url"), salt);

    // 1. Create Demo Users
    const alex = await User.create({
      name: "Alex Rivera",
      username: "alexr",
      email: "alex@unisphere.edu",
      password: demoPassword,
      role: "student",
      studentId: "UNI-2024-101",
      department: "Computer Science & Engineering",
      course: "B.Tech Computer Science",
      year: "3rd Year",
      bio: "Full-stack developer passionate about distributed systems, UI animations, and hackathons.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      skills: ["React", "Node.js", "Docker", "GraphQL", "TailwindCSS"],
      interests: ["Web3", "Hackathons", "Robotics", "Design Systems"],
    });

    const priya = await User.create({
      name: "Priya Sharma",
      username: "priyasharma",
      email: "priya@unisphere.edu",
      password: demoPassword,
      role: "student",
      studentId: "UNI-2024-102",
      department: "Artificial Intelligence & Data Science",
      course: "B.Tech AI & Data Science",
      year: "3rd Year",
      bio: "Machine Learning researcher & President of UniSphere AI Society. Always up for open-source AI collabs!",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      skills: ["Python", "PyTorch", "FastAPI", "Data Analysis", "TensorFlow"],
      interests: ["Deep Learning", "NLP", "Tech Debates", "Astronomy"],
    });

    const marcus = await User.create({
      name: "Dr. Marcus Vance",
      username: "profvance",
      email: "vance@unisphere.edu",
      password: demoPassword,
      role: "faculty",
      studentId: "FAC-889",
      department: "Computer Science & Engineering",
      course: "Faculty of Computing",
      year: "Faculty",
      bio: "Associate Professor in Distributed Computing & Systems Architecture. Office hours: Tue/Thu 2-4 PM.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      skills: ["Algorithms", "Cloud Architecture", "Database Systems"],
      interests: ["Research", "Curriculum Design", "Mentorship"],
    });

    // Follow each other
    alex.following.push(priya._id);
    priya.followers.push(alex._id);
    await alex.save();
    await priya.save();

    // 2. Create Courses
    const cs301 = await Course.create({
      code: "CS301",
      title: "Full Stack Web Development",
      description:
        "Comprehensive hands-on study of modern MERN stack development, RESTful APIs, state architecture, and micro-frontends.",
      department: "Computer Science & Engineering",
      instructor: "Dr. Marcus Vance",
      credits: 4,
      schedule: "Mon, Wed 10:00 AM - 11:30 AM",
      room: "Tech Lab 3",
      syllabus: [
        "Module 1: Advanced JavaScript ES6+ & Async Patterns",
        "Module 2: Server Architecture with Express & Node",
        "Module 3: Database Engineering with MongoDB & Mongoose",
        "Module 4: React Component Life Cycle & Responsive Design",
        "Module 5: Payment Gateways, Webhooks & Production Deployment",
      ],
      resources: [
        {
          title: "React learning guide (demo resource)",
          url: "https://react.dev/learn",
          type: "Document",
        },
        {
          title: "Node.js learning guide (demo resource)",
          url: "https://nodejs.org/en/learn",
          type: "Slides",
        },
        {
          title: "Mongoose documentation (demo resource)",
          url: "https://mongoosejs.com/docs/guide.html",
          type: "CheatSheet",
        },
      ],
      announcements: [
        {
          title: "Mid-Term Project Guidelines Released",
          content:
            "Please check the assignments tab for submission specifications and due dates.",
          date: new Date(),
        },
      ],
      enrolledStudents: [alex._id, priya._id],
      createdBy: marcus._id,
    });

    const ai202 = await Course.create({
      code: "AI202",
      title: "Foundations of Machine Learning",
      description:
        "Mathematical principles and algorithmic implementation of supervised, unsupervised, and deep learning models.",
      department: "Artificial Intelligence & Data Science",
      instructor: "Dr. Elena Rostova",
      credits: 4,
      schedule: "Tue, Thu 02:00 PM - 03:30 PM",
      room: "Auditorium 2",
      syllabus: [
        "Module 1: Linear Algebra & Probability for ML",
        "Module 2: Regression, Classification, and SVMs",
        "Module 3: Neural Networks & Backpropagation",
        "Module 4: CNNs for Computer Vision",
      ],
      resources: [
        {
          title: "PyTorch tutorials (demo resource)",
          url: "https://pytorch.org/tutorials/",
          type: "Code",
        },
      ],
      announcements: [
        {
          title: "Lab Environment Setup Instructions",
          content:
            "Ensure conda and PyTorch GPU runtimes are initialized before next Tuesday.",
          date: new Date(),
        },
      ],
      enrolledStudents: [priya._id],
      createdBy: marcus._id,
    });

    // 3. Create Assignments
    await Assignment.create({
      course: cs301._id,
      title: "Full Stack Campus Portal Sprint 1",
      description:
        "Build an interactive student portal module using React and Express with JWT authentication, responsive layout, and MongoDB persistence.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxPoints: 100,
      createdBy: marcus._id,
      submissions: [
        {
          student: alex._id,
          submissionText:
            "Initial frontend UI and JWT authentication endpoints implemented with tests passing.",
          attachmentUrl: "https://github.com/alexr/unisphere-sprint1",
          status: "Submitted",
          submittedAt: new Date(),
        },
      ],
    });

    await Assignment.create({
      course: cs301._id,
      title: "Database Modeling & Query Optimization",
      description:
        "Design relational-style schemas in Mongoose with compound indexing and aggregation pipelines.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxPoints: 50,
      createdBy: marcus._id,
    });

    // 4. Create Campus Events
    await Event.create({
      title: "UniSphere Annual Hackfest 2026",
      description:
        "36-hour flagship inter-university hackathon bringing together the brightest developers, designers, and AI creators. Over ₹2,00,000 in prizes, mentor workshops, and recruiter meetups.",
      category: "Hackathon",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: "09:00 AM - 09:00 PM (36 Hrs)",
      venue: "Main Campus Indoor Stadium & Innovation Hall",
      organizer: "UniSphere Developer Society",
      banner:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      capacity: 350,
      isPaid: true,
      fee: 299, // ₹299 entry pass
      attendees: [],
      createdBy: marcus._id,
    });

    await Event.create({
      title: "Generative AI & LLM Systems Workshop",
      description:
        "Hands-on masterclass on building autonomous multi-agent systems and fine-tuning lightweight models for web apps.",
      category: "Workshop",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      time: "02:00 PM - 05:30 PM",
      venue: "Hall of Computing 102",
      organizer: "AI & Data Science Club",
      banner:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      capacity: 120,
      isPaid: false,
      fee: 0,
      attendees: [
        { student: priya._id, paymentStatus: "Free", registeredAt: new Date() },
      ],
      createdBy: marcus._id,
    });

    // 5. Create Student Clubs
    await Club.create({
      name: "UniSphere Coding Club",
      tagline: "Build, Hack, Deploy, Repeat",
      description:
        "The primary coding community at UniSphere. We organize weekly algorithmic challenges, tech workshops, open-source sprints, and competitive coding squads.",
      category: "Technology",
      lead: "Alex Rivera",
      email: "codingclub@unisphere.edu",
      logo: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80",
      members: [alex._id, priya._id],
      announcements: [
        {
          title: "Weekly Hack Night: Thursday 6 PM",
          content:
            "Bring your laptops to Room 402 for pair programming on open-source student tools!",
          date: new Date(),
        },
      ],
      createdBy: alex._id,
    });

    await Club.create({
      name: "Robotics & Hardware Guild",
      tagline: "Bridging code with physical intelligence",
      description:
        "Dedicated to micro-controllers, autonomous rovers, drone swarms, and embedded IoT architectures for smart campus systems.",
      category: "Robotics",
      lead: "Karan Patel",
      email: "robotics@unisphere.edu",
      logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80",
      members: [alex._id],
      announcements: [
        {
          title: "Rover Chassis Assembly Session",
          content:
            "Hardware lab access granted for guild members this Saturday.",
          date: new Date(),
        },
      ],
      createdBy: alex._id,
    });

    // 6. Create Social Posts
    await Post.create({
      author: alex._id,
      content:
        "🚀 Excited to announce our campus project UniSphere is live! Built with React, Express, and MongoDB. What features would you like to see next in the academic dashboard?",
      category: "Project",
      mediaUrl:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      likes: [priya._id],
    });

    await Post.create({
      author: priya._id,
      content:
        "Our AI Society workshop on Multi-Agent Systems is happening this Thursday! We will be live-coding agentic memory loops and tool orchestration. Registration is free for all UniSphere students! 💡",
      category: "Campus",
      mediaUrl:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      likes: [alex._id],
    });

    console.log(
      "Database seeded successfully with demo users, courses, assignments, events, and clubs!",
    );
  } catch (error) {
    console.error("Seeding Error:", error.message);
  }
};
