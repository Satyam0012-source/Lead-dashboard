import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', err);
  }

  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

export const notFound = (_req: Request, res: Response): void => {
  sendError(res, 404, 'Route not found');
};
