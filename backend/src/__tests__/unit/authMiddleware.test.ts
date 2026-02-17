import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should reject request without token', () => {
      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required',
        errorCode: 'NO_TOKEN',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token',
        errorCode: 'INVALID_TOKEN',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with correct role', () => {
      const authorizeMw = authorize(UserRole.ADMIN);
      
      (mockRequest as any).user = {
        userId: 'user-id',
        role: UserRole.ADMIN,
      };

      authorizeMw(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      const authorizeMw = authorize(UserRole.ADMIN);
      
      (mockRequest as any).user = {
        userId: 'user-id',
        role: UserRole.SUBMITTER,
      };

      authorizeMw(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        errorCode: 'FORBIDDEN',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should authorize user with any of multiple allowed roles', () => {
      const authorizeMw = authorize(UserRole.ADMIN, UserRole.SUBMITTER);
      
      (mockRequest as any).user = {
        userId: 'user-id',
        role: UserRole.SUBMITTER,
      };

      authorizeMw(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
