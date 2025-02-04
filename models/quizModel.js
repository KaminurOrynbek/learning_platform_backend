import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
});

export const Quiz = mongoose.model("Quiz", quizSchema);