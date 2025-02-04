// Mock the Quiz model
jest.mock("../models/quizModel.js", () => ({
    Quiz: {
        create: jest.fn(),
        findById: jest.fn(),
    },
}));

// Mock the User model
jest.mock("../models/User.js", () => ({
    User: {
        findById: jest.fn(),
        save: jest.fn(),
    },
}));

const {
    createQuiz,
    getQuiz,
    submitQuiz,
    getQuizResults,
} = require("../controllers/quiz.js");

describe("Quiz Controllers", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("createQuiz", () => {
        test("should create a new quiz successfully", async () => {
            const req = {
                body: {
                    title: "Sample Quiz",
                    questions: [],
                    courseId: "courseId123",
                },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const Quiz = require("../models/quizModel.js").Quiz;
            Quiz.create.mockResolvedValue({ id: "quizId123" });

            await createQuiz(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Quiz Created Successfully",
                    quiz: { id: "quizId123" },
                })
            );
        });
    });

    describe("getQuiz", () => {
        test("should return quiz details", async () => {
            const req = { params: { id: "quizId123" } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const Quiz = require("../models/quizModel.js").Quiz;
            Quiz.findById.mockResolvedValue({
                id: "quizId123",
                title: "Sample Quiz",
            });

            await getQuiz(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    quiz: { id: "quizId123", title: "Sample Quiz" },
                })
            );
        });

        test("should return 404 if quiz not found", async () => {
            const req = { params: { id: "invalidQuizId" } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const Quiz = require("../models/quizModel.js").Quiz;
            Quiz.findById.mockResolvedValue(null);

            await getQuiz(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Quiz not found",
                })
            );
        });
    });

    describe("submitQuiz", () => {
        test("should submit quiz and calculate score", async () => {
            const req = {
                body: {
                    userId: "userId123",
                    quizId: "quizId123",
                    answers: ["A", "B"],
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const User = require("../models/User.js").User;
            User.findById.mockResolvedValue({
                _id: "userId123",
                quizResults: [],
                save: jest.fn(),
            });

            const Quiz = require("../models/quizModel.js").Quiz;
            Quiz.findById.mockResolvedValue({
                id: "quizId123",
                questions: [
                    { question: "Q1", correctAnswer: "A" },
                    { question: "Q2", correctAnswer: "C" },
                ],
            });

            await submitQuiz(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Quiz Submitted Successfully",
                    score: 1,
                    results: [
                        {
                            question: "Q1",
                            correctAnswer: "A",
                            userAnswer: "A",
                            isCorrect: true,
                        },
                        {
                            question: "Q2",
                            correctAnswer: "C",
                            userAnswer: "B",
                            isCorrect: false,
                        },
                    ],
                })
            );
        });

        // ...additional tests...
    });

    describe("getQuizResults", () => {
        test("should return quiz results for a user", async () => {
            const req = {
                params: { id: "quizId123" },
                user: { _id: "userId123" },
            };
            const res = {
                json: jest.fn(),
            };

            const User = require("../models/User.js").User;
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    _id: "userId123",
                    quizResults: [
                        {
                            quiz: { _id: "quizId123" },
                            score: 2,
                            answers: ["A", "C"],
                        },
                    ],
                }),
            });

            const Quiz = require("../models/quizModel.js").Quiz;
            Quiz.findById.mockResolvedValue({
                id: "quizId123",
                course: "courseId123",
                questions: [
                    { question: "Q1", correctAnswer: "A" },
                    { question: "Q2", correctAnswer: "C" },
                ],
            });

            await getQuizResults(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    results: [
                        {
                            question: "Q1",
                            correctAnswer: "A",
                            userAnswer: "A",
                            isCorrect: true,
                            course: "courseId123",
                        },
                        {
                            question: "Q2",
                            correctAnswer: "C",
                            userAnswer: "C",
                            isCorrect: true,
                            course: "courseId123",
                        },
                    ],
                })
            );
        });

        test("should return 404 if quiz results not found", async () => {
            const req = {
                params: { id: "nonExistentQuizId" },
                user: { _id: "userId123" },
            };
            const res = {
                status: jest.fn().mockReturnThis(), // Ensure 'status' is mocked
                json: jest.fn(),
            };

            const User = require("../models/User.js").User;
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    _id: "userId123",
                    quizResults: [],
                }),
            });

            await getQuizResults(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Quiz results not found",
                })
            );
        });

        // ...additional tests...
    });
});
