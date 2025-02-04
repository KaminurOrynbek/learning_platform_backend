// filepath: /Elearning/server/index.js
import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './database/db.js';
import cors from 'cors';
import quizRoutes from './routes/quiz.js';

dotenv.config();

const app = express();

// using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Server is working');
});

app.use('/uploads', express.static('uploads'));

// importing routes
import userRoutes from './routes/user.js';
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';
import youtubeRoutes from './routes/youtube.js';

// using routes
app.use('/api', userRoutes);
app.use('/api', courseRoutes);
app.use('/api', adminRoutes);
app.use('/api', youtubeRoutes);
app.use('/api', quizRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});