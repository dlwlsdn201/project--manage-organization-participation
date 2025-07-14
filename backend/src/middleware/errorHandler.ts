import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = '서버 내부 오류가 발생했습니다.';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '입력 데이터가 올바르지 않습니다.';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = '잘못된 ID 형식입니다.';
  } else if (
    error.name === 'MongoServerError' &&
    (error as any).code === 11000
  ) {
    statusCode = 409;
    message = '이미 존재하는 데이터입니다.';
  }

  // 개발 환경에서는 상세한 에러 정보 제공
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };

  console.error(`❌ Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>
): void => {
  res.status(404).json({
    success: false,
    message: `요청하신 경로 ${req.originalUrl}를 찾을 수 없습니다.`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
