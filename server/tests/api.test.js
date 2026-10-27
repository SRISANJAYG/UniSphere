import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "integration-test-secret-not-used-in-production";
const { default: app } = await import("../index.js");
const { default: User } = await import("../models/user.model.js");
let db, server, base;
const request = async (path, { method = "GET", body, cookie } = {}) => {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
};
test("UniSphere complete student and faculty API workflow", async () => {
  try {
    db = await MongoMemoryServer.create();
    await mongoose.connect(db.getUri());
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    base = "http://127.0.0.1:" + server.address().port;
    assert.equal((await request("/api/courses")).status, 401);
    const reg = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test Student",
        username: "student_one",
        email: "one@example.test",
        password: "TestPass123",
      },
    });
    assert.equal(reg.status, 201);
    assert.ok(reg.cookie);
    assert.equal(reg.data.user.role, "student");
    assert.equal(reg.data.user.password, undefined);
    assert.equal(reg.data.token, undefined);
    const cookie = reg.cookie;
    assert.equal((await request("/api/users/profile", { cookie })).status, 200);
    assert.equal(
      (await request("/api/courses", { cookie, method: "POST", body: {} }))
        .status,
      403,
    );
    assert.equal(
      (await request("/api/assignments", { cookie, method: "POST", body: {} }))
        .status,
      403,
    );
    assert.equal(
      (await request("/api/events", { cookie, method: "POST", body: {} }))
        .status,
      403,
    );
    const faculty = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test Faculty",
        username: "faculty_one",
        email: "faculty@example.test",
        password: "TestPass123",
      },
    });
    await User.updateOne(
      { _id: faculty.data.user._id },
      { $set: { role: "faculty" } },
    );
    const staffCookie = faculty.cookie;
    const course = await request("/api/courses", {
      cookie: staffCookie,
      method: "POST",
      body: {
        code: "TEST101",
        title: "Integration Course",
        description: "A course for API verification",
        department: "Computing",
        instructor: "Test Faculty",
        credits: 3,
      },
    });
    assert.equal(course.status, 201, JSON.stringify(course.data));
    const courseId = course.data.course._id;
    assert.equal(
      (
        await request("/api/courses/" + courseId + "/enroll", {
          cookie,
          method: "POST",
        })
      ).status,
      200,
    );
    const assignment = await request("/api/assignments", {
      cookie: staffCookie,
      method: "POST",
      body: {
        courseId,
        title: "Test assignment",
        description: "Submit text",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    assert.equal(assignment.status, 201);
    assert.equal(
      (
        await request(
          "/api/assignments/" + assignment.data.assignment._id + "/submit",
          { cookie, method: "POST", body: { submissionText: "My submission" } },
        )
      ).status,
      200,
    );
    const announcement = await request(
      "/api/courses/" + courseId + "/announcement",
      {
        cookie: staffCookie,
        method: "POST",
        body: { title: "Course update", content: "Welcome to class" },
      },
    );
    assert.equal(announcement.status, 200);
    assert.equal(
      (
        await request("/api/courses/" + courseId + "/resource", {
          cookie: staffCookie,
          method: "POST",
          body: { title: "Notes", url: "javascript:alert(1)" },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/courses/" + courseId + "/resource", {
          cookie: staffCookie,
          method: "POST",
          body: { title: "Notes", url: "https://react.dev/learn" },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(
          "/api/assignments/" + assignment.data.assignment._id + "/grade",
          {
            cookie: staffCookie,
            method: "POST",
            body: {
              studentId: reg.data.user._id,
              grade: 90,
              feedback: "Good work",
            },
          },
        )
      ).status,
      200,
    );
    const otherSub = await request(
      "/api/assignments/" + assignment.data.assignment._id,
      { cookie: staffCookie },
    );
    assert.equal(otherSub.data.assignment.submissions.length, 1);
    const ownSub = await request(
      "/api/assignments/" + assignment.data.assignment._id,
      { cookie },
    );
    assert.equal(ownSub.data.assignment.mySubmission.grade, 90);
    const post = await request("/api/posts", {
      cookie,
      method: "POST",
      body: { content: "Hello campus" },
    });
    assert.equal(post.status, 201);
    const postId = post.data.post._id;
    assert.equal(
      (
        await request("/api/posts/" + postId, {
          cookie: staffCookie,
          method: "PUT",
          body: { content: "Not mine" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/posts/" + postId + "/like", {
          cookie: staffCookie,
          method: "POST",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request("/api/posts/" + postId + "/comment", {
          cookie: staffCookie,
          method: "POST",
          body: { content: "Welcome" },
        })
      ).status,
      201,
    );
    assert.equal(
      (
        await request("/api/users/" + faculty.data.user._id + "/follow", {
          cookie,
          method: "POST",
        })
      ).status,
      200,
    );
    const club = await request("/api/clubs", {
      cookie,
      method: "POST",
      body: {
        name: "Test Club",
        description: "A test community",
        lead: "Student",
      },
    });
    assert.equal(club.status, 201);
    assert.equal(
      (
        await request("/api/clubs/" + club.data.club._id + "/join", {
          cookie: staffCookie,
          method: "POST",
        })
      ).status,
      200,
    );
    const event = await request("/api/events", {
      cookie: staffCookie,
      method: "POST",
      body: {
        title: "Test Event",
        description: "Test workshop",
        date: new Date(Date.now() + 86400000).toISOString(),
        time: "10:00",
        venue: "Lab",
        organizer: "Faculty",
        capacity: 10,
      },
    });
    assert.equal(event.status, 201);
    assert.equal(
      (
        await request("/api/events/" + event.data.event._id + "/register", {
          cookie,
          method: "POST",
        })
      ).status,
      200,
    );
    process.env.RAZORPAY_KEY_ID = "";
    process.env.RAZORPAY_KEY_SECRET = "";
    assert.equal(
      (await request("/api/payments/key", { cookie })).data.isConfigured,
      false,
    );
    assert.equal(
      (
        await request("/api/payments/verify", {
          cookie,
          method: "POST",
          body: {},
        })
      ).status,
      400,
    );
    assert.equal(
      (await request("/api/courses/not-an-id", { cookie })).status,
      400,
    );
    const forbidden = await fetch(base + "/api/auth/logout", {
      method: "POST",
      headers: { Origin: "https://untrusted.example" },
    });
    assert.equal(forbidden.status, 403);
    const notifications = await request("/api/notifications", { cookie });
    assert.ok(notifications.data.notifications.length > 0);
    assert.equal(
      (await request("/api/notifications/read-all", { cookie, method: "PUT" }))
        .status,
      200,
    );
    assert.equal(
      (
        await request("/api/users/profile", {
          cookie,
          method: "PUT",
          body: { bio: "Updated biography", skills: "React, Node" },
        })
      ).status,
      200,
    );
    const login = await request("/api/auth/login", {
      method: "POST",
      body: { loginIdentifier: "one@example.test", password: "TestPass123" },
    });
    assert.equal(login.status, 200);
    assert.equal(
      (await request("/api/auth/logout", { method: "POST", cookie })).status,
      200,
    );
    assert.equal(
      (await request("/api/posts/" + postId, { cookie, method: "DELETE" }))
        .status,
      200,
    );
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (db) await db.stop();
  }
});
