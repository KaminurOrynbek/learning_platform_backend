import express from "express";
import { createQuiz, getQuiz, submitQuiz, getQuizResults } from "../controllers/quiz.js";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/quiz/new", isAuth, isAdmin, createQuiz);
router.get("/quiz/:id", isAuth, getQuiz);
router.post("/quiz/submit", isAuth, submitQuiz);
router.get("/quiz/results/:id", isAuth, getQuizResults);

export default router;