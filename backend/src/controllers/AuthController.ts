import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        errorCode: 'REGISTRATION_FAILED',
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        errorCode: 'LOGIN_FAILED',
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        errorCode: 'TOKEN_REFRESH_FAILED',
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        errorCode: 'LOGOUT_FAILED',
      });
    }
  };
}
