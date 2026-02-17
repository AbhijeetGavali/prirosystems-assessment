import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../../routes/auth';
import { AuthService } from '../../services/AuthService';

jest.mock('../../services/AuthService');

const app: Application = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Submitter',
      };

      (AuthService.prototype.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'Submitter',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
          role: 'Submitter',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
          role: 'Submitter',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      (AuthService.prototype.login as jest.Mock).mockResolvedValue({
        user: { id: 'user-id', email: 'john@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });
});
