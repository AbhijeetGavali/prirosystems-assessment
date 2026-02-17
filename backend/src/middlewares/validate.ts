import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = { ...req.body, ...req.query, ...req.params };
      schema.parse(data);
      next();
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          errors: zodError.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
        });
      }
    }
  };
};
