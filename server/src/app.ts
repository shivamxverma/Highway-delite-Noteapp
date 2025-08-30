import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app : Application = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:5173", "https://highway-delite-noteapp.vercel.app"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/user.routes.js';
import noteRoutes from './routes/note.routes.js';

app.use('/api/v1/notes', noteRoutes);

app.use('/api/v1/users', userRoutes);

export {app};