import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let dataSource: DataSource;

  const mockUser = {
    id: 'uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedPassword',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user info with token', async () => {
      const dto = { email: 'test@example.com', username: 'testuser', password: 'Password123!' };
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockUser); // save user
      mockQueryRunner.manager.save.mockResolvedValueOnce({}); // save wallet

      const result = await service.register(dto);

      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe('token');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user info and token for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'Password123!' });

      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBe('token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
