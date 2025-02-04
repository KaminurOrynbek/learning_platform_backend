// Mock the Courses model
jest.mock("../models/Courses.js", () => ({
    Courses: {
        find: jest.fn(),
    },
}));

// Mock the Lecture model
jest.mock("../models/Lecture.js", () => ({
    Lecture: {
        find: jest.fn(),
    },
}));

// Mock the User model with all required methods in a single mock
jest.mock("../models/User.js", () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        updateMany: jest.fn(),
        save: jest.fn(),
        find: jest.fn(), // Ensure 'find' is included
    },
}));

const { getAllStats } = require("../controllers/admin.js");

describe("getAllStats", () => {
    beforeAll(() => {
        const { Courses } = require("../models/Courses.js");
        const { Lecture } = require("../models/Lecture.js");
        const { User } = require("../models/User.js");

        Courses.find.mockResolvedValue([{}, {}]); // Mock 2 courses
        Lecture.find.mockResolvedValue([{}, {}, {}]); // Mock 3 lectures
        User.find.mockResolvedValue([{}, {}, {}, {}]); // Mock 4 users
    });

    test("should return stats", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getAllStats(req, res);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                stats: {
                    totalCourses: 2,
                    totalLectures: 3,
                    totalUsers: 4,
                },
            })
        );
    });
});

const {
    register,
    verifyUser,
    loginUser,
    myProfile,
    forgotPassword,
    resetPassword,
} = require("../controllers/user.js");

// Mock sendMail middleware
jest.mock("../middlewares/sendMail.js", () => ({
    __esModule: true,
    default: jest.fn(),
    sendForgotMail: jest.fn(),
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe("User Controllers", () => {
    describe("register", () => {
        test("should register a new user and send OTP", async () => {
            const req = {
                body: {
                    email: "test@example.com",
                    name: "Test",
                    password: "password",
                },
                file: { path: "path/to/image.jpg" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const User = require("../models/User.js").User;
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: "userId123" });

            const jwt = require("jsonwebtoken");
            jwt.sign.mockReturnValue("activationToken");

            const sendMail = require("../middlewares/sendMail.js").default;
            sendMail.mockResolvedValue();

            const bcrypt = require("bcrypt");
            bcrypt.hash.mockResolvedValue("hashedPassword");

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Otp send to your mail",
                    activationToken: "activationToken",
                })
            );
        });

        test("should not register if user already exists", async () => {
            const req = {
                body: {
                    email: "test@example.com",
                    name: "Test",
                    password: "password",
                },
                file: {},
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const User = require("../models/User.js").User;
            User.findOne.mockResolvedValue({});

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "User Already exists",
                })
            );
        });
    });

    describe("verifyUser", () => {
        test("should verify user with correct OTP", async () => {
            const req = {
                body: { otp: 123456, activationToken: "validToken" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValue({
                otp: 123456,
                user: {
                    name: "Test",
                    email: "test@example.com",
                    password: "hashedPassword",
                },
            });

            const User = require("../models/User.js").User;
            User.create.mockResolvedValue({ id: "userId123" });

            await verifyUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "User Registered",
                })
            );
        });

        test("should not verify with incorrect OTP", async () => {
            const req = {
                body: { otp: 654321, activationToken: "validToken" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValue({ otp: 123456, user: {} });

            await verifyUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Wrong Otp",
                })
            );
        });
    });

    describe("loginUser", () => {
        test("should login user with correct credentials", async () => {
            const req = {
                body: { email: "test@example.com", password: "password" },
            };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            const User = require("../models/User.js").User;
            User.findOne.mockResolvedValue({
                _id: "userId123",
                name: "Test",
                email: "test@example.com",
                password: "hashedPassword",
            });

            const bcrypt = require("bcrypt");
            bcrypt.compare.mockResolvedValue(true);

            const jwt = require("jsonwebtoken");
            jwt.sign.mockReturnValue("jwtToken");

            await loginUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Welcome back Test",
                    token: "jwtToken",
                    user: {
                        _id: "userId123",
                        name: "Test",
                        email: "test@example.com",
                        password: "hashedPassword",
                    },
                })
            );
        });

        test("should not login with incorrect password", async () => {
            const req = {
                body: { email: "test@example.com", password: "wrongPassword" },
            };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            const User = require("../models/User.js").User;
            User.findOne.mockResolvedValue({ password: "hashedPassword" });

            const bcrypt = require("bcrypt");
            bcrypt.compare.mockResolvedValue(false);

            await loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "wrong Password",
                })
            );
        });
    });

    // ...additional tests for myProfile, forgotPassword, resetPassword...
});
