import { User } from '../models/User';
import { IUser, UserRole } from '../types';
import { Types } from 'mongoose';

export class UserRepository {
  async create(userData: { name: string; email: string; password: string; role: UserRole }): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: Types.ObjectId): Promise<IUser | null> {
    return await User.findById(id).select('-password');
  }

  async findByRole(role: UserRole): Promise<IUser[]> {
    return await User.find({ role }).select("-password").lean<IUser[]>();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<IUser[]> {
    return await User.find({ 
      _id: { $in: ids },
      role: UserRole.APPROVER 
    }).select('-password').lean<IUser[]>();
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().select("-password").lean<IUser[]>();
  }
}
