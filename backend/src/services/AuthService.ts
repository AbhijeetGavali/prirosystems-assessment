import { UserRepository } from "../repositories/UserRepository";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";
import { UserRole } from "../types";
import { Types } from "mongoose";

export class AuthService {
  private userRepo = new UserRepository();
  private refreshTokenRepo = new RefreshTokenRepository();

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{
    user: { id: string; name: string; email: string; role: UserRole };
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = await this.userRepo.create(data);
    const { accessToken, refreshToken } = await this.generateTokens(
      user._id,
      user.email,
      user.role,
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: { id: string; name: string; email: string; role: UserRole };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user._id,
      user.email,
      user.role,
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const tokenDoc = await this.refreshTokenRepo.findByToken(refreshToken);
    if (!tokenDoc) {
      throw new Error("Invalid refresh token");
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
        userId: string;
        email: string;
        role: UserRole;
      };

      const accessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role },
        config.jwtAccessSecret,
        { expiresIn: config.jwtAccessExpiry } as SignOptions,
      );

      return { accessToken };
    } catch (error) {
      await this.refreshTokenRepo.deleteByToken(refreshToken);
      throw new Error("Invalid or expired refresh token");
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.deleteByToken(refreshToken);
  }

  private async generateTokens(
    userId: Types.ObjectId,
    email: string,
    role: UserRole,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(
      { userId: userId.toString(), email, role },
      config.jwtAccessSecret,
      {
        expiresIn: config.jwtAccessExpiry,
      } as SignOptions,
    );

    const refreshToken = jwt.sign(
      { userId: userId.toString(), email, role },
      config.jwtRefreshSecret,
      {
        expiresIn: config.jwtRefreshExpiry,
      } as SignOptions,
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.refreshTokenRepo.create(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}
