import { UserRepository } from '../repositories/UserRepository';
import { UserRole } from '../types';

export class UserService {
  private userRepo = new UserRepository();

  async getApprovers(): Promise<Array<{ id: string; name: string; email: string }>> {
    const approvers = await this.userRepo.findByRole(UserRole.APPROVER);
    return approvers.map((a) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
    }));
  }

  async getAllUsers(): Promise<Array<{ id: string; name: string; email: string; role: UserRole }>> {
    const users = await this.userRepo.findAll();
    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }
}
