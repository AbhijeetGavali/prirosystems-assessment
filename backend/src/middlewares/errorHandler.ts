import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error occurred', { error: err.message, stack: err.stack, path: req.path });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};
