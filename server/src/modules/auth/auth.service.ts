import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Wallet } from '../wallet/entities/wallet.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @InjectQueue('mail-processing') private readonly mailQueue: Queue,
  ) { }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: dto.email,
        username: dto.username,
        fullName: dto.fullName,
        passwordHash,
      });

      const savedUser = await queryRunner.manager.save(user);

      const wallet = queryRunner.manager.create(Wallet, {
        userId: savedUser.id,
        balance: 0,
        currency: 'NGN',
      });

      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      // Send welcome email in background
      await this.mailQueue.add('send-welcome-email', {
        email: savedUser.email,
        type: 'WELCOME',
        data: { username: savedUser.username, fullName: savedUser.fullName },
      });

      const { accessToken, refreshToken } = this.generateTokens(savedUser);
      
      await this.auditService.log(
        savedUser,
        'REGISTER',
        'User',
        savedUser.id,
        { email: savedUser.email, username: savedUser.username, fullName: savedUser.fullName },
        null,
        ipAddress,
        userAgent
      );

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          username: savedUser.username,
          fullName: savedUser.fullName,
        },
        accessToken,
        refreshToken,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    await this.auditService.log(
      user,
      'LOGIN',
      'User',
      user.id,
      null,
      null,
      ipAddress,
      userAgent
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    
    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '30d',
    });

    return { accessToken, refreshToken };
  }
}
