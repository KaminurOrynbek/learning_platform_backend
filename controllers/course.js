import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.json({
    courses,
  });
});

export const subscribeCourse = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  user.subscription.push(course._id);

  await Progress.create({
    course: course._id,
    completedLectures: [],
    user: req.user._id,
  });

  await user.save();

  res.status(200).json({
    message: "Course Subscribed Successfully",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    course: req.params.id,
    user: req.user._id,
  }).populate("completedLectures");

  if (!progress) {
    return res.status(404).json({
      message: "Progress not found",
    });
  }

  const totalLectures = await Lecture.countDocuments({ course: req.params.id });
  const completedLectures = progress.completedLectures.length;
  const courseProgressPercentage = (completedLectures / totalLectures) * 100;

  res.json({
    progress,
    courseProgressPercentage,
    completedLectures,
    totalLectures,
  });
});