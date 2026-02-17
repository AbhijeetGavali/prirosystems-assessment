import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};
