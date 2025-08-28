import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/user.routes';
import noteRoutes from './routes/note.routes';

app.use('/api/v1/notes', noteRoutes);

app.use('/api/v1/users', userRoutes);

export {app};