// Mock the Courses model
jest.mock("../models/Courses.js", () => ({
    Courses: {
        find: jest.fn(), // Ensure 'find' is mocked
    },
}));

// Mock the Lecture model
jest.mock("../models/Lecture.js", () => ({
    Lecture: {
        find: jest.fn(), // Ensure 'find' is mocked
    },
}));

// Mock the User model
jest.mock("../models/User.js", () => ({
    User: {
        find: jest.fn(), // Ensure 'find' is mocked
    },
}));

const { getAllStats } = require("../controllers/admin.js"); // Import after mocks

describe("getAllStats", () => {
    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test

        const { Courses } = require("../models/Courses.js");
        const { Lecture } = require("../models/Lecture.js");
        const { User } = require("../models/User.js");

        Courses.find.mockResolvedValue([{}, {}]); // Mock 2 courses
        Lecture.find.mockResolvedValue([{}, {}, {}]); // Mock 3 lectures
        User.find.mockResolvedValue([{}, {}, {}, {}]); // Mock 4 users
    });

    test("should return stats", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(), // Mock res.status
            json: jest.fn(),
        };

        await getAllStats(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                stats: {
                    totalCourses: 2, // Ensure correct property name
                    totalLectures: 3,
                    totalUsers: 4,
                },
            })
        );
    });
});
