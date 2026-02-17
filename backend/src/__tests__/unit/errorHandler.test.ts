import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middlewares/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/test-path',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle errors and return 500 status', () => {
    const error = new Error('Test error message');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  });

  it('should include error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error message');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      error: 'Test error message',
    });

    process.env.NODE_ENV = originalEnv;
  });
});
