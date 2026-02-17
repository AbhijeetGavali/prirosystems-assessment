import { AuthService } from '../../services/AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { RefreshTokenRepository } from '../../repositories/RefreshTokenRepository';
import { Types } from 'mongoose';
import { UserRole } from '../../types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../repositories/UserRepository');
jest.mock('../../repositories/RefreshTokenRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenRepo: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    mockUserRepo = new UserRepository() as jest.Mocked<UserRepository>;
    mockTokenRepo = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    
    authService = new AuthService();
    (authService as any).userRepo = mockUserRepo;
    (authService as any).refreshTokenRepo = mockTokenRepo;
    
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.SUBMITTER,
      };

      const mockUser = {
        _id: new Types.ObjectId(),
        ...userData,
        password: 'hashedPassword',
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser as any);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      mockTokenRepo.create.mockResolvedValue({} as any);

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(userData.email);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.SUBMITTER,
      };

      mockUserRepo.findByEmail.mockResolvedValue({ email: userData.email } as any);

      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: new Types.ObjectId(),
        email: credentials.email,
        password: 'hashedPassword',
        name: 'John Doe',
        role: UserRole.SUBMITTER,
      };

      mockUserRepo.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      mockTokenRepo.create.mockResolvedValue({} as any);

      const result = await authService.login(credentials.email, credentials.password);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('mock-token');
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
    });

    it('should throw error for invalid email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password123')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      mockUserRepo.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('john@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userId = new Types.ObjectId();

      const mockToken = {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockTokenRepo.findByToken.mockResolvedValue(mockToken as any);
      (jwt.verify as jest.Mock).mockReturnValue({ 
        userId: userId.toString(),
        email: 'test@example.com',
        role: UserRole.SUBMITTER
      });
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      mockTokenRepo.findByToken.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      const refreshToken = 'valid-refresh-token';
      mockTokenRepo.deleteByToken.mockResolvedValue(undefined);

      await authService.logout(refreshToken);

      expect(mockTokenRepo.deleteByToken).toHaveBeenCalledWith(refreshToken);
    });
  });
});
