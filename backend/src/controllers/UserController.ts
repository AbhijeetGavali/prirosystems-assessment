import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService = new UserService();

  getApprovers = async (req: Request, res: Response): Promise<void> => {
    try {
      const approvers = await this.userService.getApprovers();
      res.status(200).json({
        success: true,
        data: approvers,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch approvers',
        errorCode: 'FETCH_APPROVERS_FAILED',
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
        errorCode: 'FETCH_USERS_FAILED',
      });
    }
  };
}
