import { RefreshToken } from '../models/RefreshToken';
import { IRefreshToken } from '../types';
import { Types } from 'mongoose';

export class RefreshTokenRepository {
  async create(userId: Types.ObjectId, token: string, expiresAt: Date): Promise<IRefreshToken> {
    const refreshToken = new RefreshToken({ userId, token, expiresAt });
    return await refreshToken.save();
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ token });
  }

  async deleteByToken(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }
}
