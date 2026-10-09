import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safeResourceUrl,
  validateCourse,
  validateMeeting,
  deleteCourse,
  taiwanDate,
} from "./domain.ts";
test("deadline is interpreted in Taiwan regardless of browser time zone", () => {
  assert.equal(taiwanDate("2026-10-12T09:00"), "2026-10-12T01:00:00.000Z");
  assert.equal(taiwanDate("invalid"), null);
});
test("links reject script execution, credentials, and malformed input", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://user:pass@example.com",
    "invalid",
  ])
    assert.equal(safeResourceUrl(value), null);
  assert.equal(
    safeResourceUrl("https://www.fcu.edu.tw"),
    "https://www.fcu.edu.tw/",
  );
});
test("class times cannot run backwards or overflow a day", () => {
  const meeting = {
    id: "m",
    courseId: "c",
    day: 1,
    start: "08:10",
    end: "09:00",
    room: "",
  };
  assert.equal(validateMeeting(meeting), null);
  for (const changes of [{ end: "08:00" }, { day: 0 }, { start: "25:00" }])
    assert.ok(validateMeeting({ ...meeting, ...changes }));
});
test("course deletion removes related records without affecting another course", () => {
  const task = {
    title: "Homework",
    kind: "assignment" as const,
    due: "2026-10-10T12:00",
    done: false,
    reminderDays: null,
  };
  const result = deleteCourse("a", {
    courses: [],
    tasks: [
      { ...task, id: "t", courseId: "a" },
      { ...task, id: "u", courseId: "b" },
    ],
    meetings: [
      {
        id: "m",
        courseId: "a",
        day: 1,
        start: "08:10",
        end: "09:00",
        room: "",
      },
    ],
    notes: [{ id: "n", courseId: "a", title: "Note", body: "" }],
  });
  assert.equal(result.tasks.length, 1);
  assert.equal(result.tasks[0].courseId, "b");
  assert.equal(result.notes.length, 0);
  assert.equal(result.meetings.length, 0);
});
test("semester and credits are bounded", () => {
  const course = {
    id: "c",
    semester: "115-1",
    code: "",
    name: "Physics",
    instructor: "",
    credits: 3,
    room: "",
    color: "blue",
  };
  assert.equal(validateCourse(course), null);
  assert.ok(validateCourse({ ...course, credits: -1 }));
  assert.ok(validateCourse({ ...course, semester: "2026" }));
});
