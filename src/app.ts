import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes';
import { sendResponse, formatError } from './helpers/globals';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Education Management System API is running' });
});

app.use('/api/v1', router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ code: 404, message: `Not found route ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const formatted = formatError(err);
  sendResponse(res, { code: formatted.code, message: formatted.message, data: (formatted as any).data });
});

export default app;
