const {
    getAllCourses,
    getSingleCourse,
    fetchLectures,
    fetchLecture,
    getMyCourses,
    subscribeCourse,
    getYourProgress,
} = require("../controllers/course.js");

// Mock the Courses model
jest.mock("../models/Courses.js", () => ({
    Courses: {
        find: jest.fn(),
        findById: jest.fn(),
    },
}));

// Mock the Lecture model
jest.mock("../models/Lecture.js", () => ({
    Lecture: {
        find: jest.fn(),
        findById: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

// Mock the User model with 'role' property
jest.mock("../models/User.js", () => ({
    User: {
        findById: jest.fn(),
        save: jest.fn(),
    },
}));

// Mock the Progress model with 'populate' and 'create' methods
jest.mock("../models/Progress.js", () => ({
    Progress: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

describe("Course Controllers", () => {
    describe("getAllCourses", () => {
        test("should return all courses", async () => {
            const req = {};
            const res = { json: jest.fn() };

            const Courses = require("../models/Courses.js").Courses;
            Courses.find.mockResolvedValue([
                { id: "course1" },
                { id: "course2" },
            ]);

            await getAllCourses(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    courses: [{ id: "course1" }, { id: "course2" }],
                })
            );
        });
    });

    describe("getSingleCourse", () => {
        test("should return single course details", async () => {
            const req = { params: { id: "courseId123" } };
            const res = { json: jest.fn() };

            const Courses = require("../models/Courses.js").Courses;
            Courses.findById.mockResolvedValue({
                id: "courseId123",
                title: "Sample Course",
            });

            await getSingleCourse(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    course: { id: "courseId123", title: "Sample Course" },
                })
            );
        });
    });

    describe("fetchLectures", () => {
        test("should return lectures for admin", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123", role: "admin" },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Lecture = require("../models/Lecture.js").Lecture;
            Lecture.find.mockResolvedValue([
                { id: "lecture1" },
                { id: "lecture2" },
            ]);

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({ role: "admin" });

            await fetchLectures(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    lectures: [{ id: "lecture1" }, { id: "lecture2" }],
                })
            );
        });

        test("should not return lectures if user not subscribed", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123", role: "user", subscription: [] },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Lecture = require("../models/Lecture.js").Lecture;
            Lecture.find.mockResolvedValue([
                { id: "lecture1" },
                { id: "lecture2" },
            ]);

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({ role: "user", subscription: [] });

            await fetchLectures(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "You have not subscribed to this course",
                })
            );
        });
    });

    describe("fetchLecture", () => {
        test("should return lecture for admin", async () => {
            const req = {
                params: { id: "lectureId123" },
                user: { _id: "userId123", role: "admin" },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Lecture = require("../models/Lecture.js").Lecture;
            Lecture.findById.mockResolvedValue({
                id: "lectureId123",
                title: "Sample Lecture",
                course: "courseId123",
            });

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({ role: "admin" });

            await fetchLecture(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    lecture: {
                        id: "lectureId123",
                        title: "Sample Lecture",
                        course: "courseId123",
                    },
                })
            );
        });

        test("should not return lecture if user not subscribed", async () => {
            const req = {
                params: { id: "lectureId123" },
                user: { _id: "userId123", role: "user", subscription: [] },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Lecture = require("../models/Lecture.js").Lecture;
            Lecture.findById.mockResolvedValue({
                id: "lectureId123",
                course: "courseId123",
            });

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({ role: "user", subscription: [] });

            await fetchLecture(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "You have not subscribed to this course",
                })
            );
        });
    });

    describe("getMyCourses", () => {
        test("should return user's subscribed courses", async () => {
            const req = {
                user: {
                    _id: "userId123",
                    subscription: ["courseId123", "courseId456"],
                },
            };
            const res = { json: jest.fn() };

            const Courses = require("../models/Courses.js").Courses;
            Courses.find.mockResolvedValue([
                { id: "courseId123" },
                { id: "courseId456" },
            ]);

            await getMyCourses(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    courses: [{ id: "courseId123" }, { id: "courseId456" }],
                })
            );
        });
    });

    describe("subscribeCourse", () => {
        test("should subscribe user to a course successfully", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({
                _id: "userId123",
                subscription: [],
                save: jest.fn(),
            });

            const Courses = require("../models/Courses.js").Courses;
            Courses.findById.mockResolvedValue({ _id: "courseId123" });

            const Progress = require("../models/Progress.js").Progress;
            Progress.create.mockResolvedValue({});

            await subscribeCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Course Subscribed Successfully",
                })
            );
        });

        test("should not subscribe if already subscribed", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({
                _id: "userId123",
                subscription: ["courseId123"],
                save: jest.fn(),
            });

            const Courses = require("../models/Courses.js").Courses;
            Courses.findById.mockResolvedValue({ _id: "courseId123" });

            await subscribeCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "You already have this course",
                })
            );
        });
    });

    describe("getYourProgress", () => {
        test("should return user progress for a course", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123" },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Progress = require("../models/Progress.js").Progress;
            Progress.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    completedLectures: ["lecture1", "lecture2"],
                }),
            });

            const Lecture = require("../models/Lecture.js").Lecture;
            Lecture.countDocuments.mockResolvedValue(4);

            await getYourProgress(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    progress: { completedLectures: ["lecture1", "lecture2"] },
                    courseProgressPercentage: 50,
                    completedLectures: 2,
                    totalLectures: 4,
                })
            );
        });

        test("should return 404 if progress not found", async () => {
            const req = {
                params: { id: "courseId123" },
                user: { _id: "userId123" },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const Progress = require("../models/Progress.js").Progress;
            Progress.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await getYourProgress(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Progress not found",
                })
            );
        });
    });
});
