import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { Types } from 'mongoose';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    userId: Types.ObjectId;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtAccessSecret) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    req.user = {
      userId: new Types.ObjectId(decoded.userId),
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errorCode: 'INVALID_TOKEN',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errorCode: 'FORBIDDEN',
      });
      return;
    }
    next();
  };
};
