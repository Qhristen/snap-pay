import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { Wallet } from "../wallet/entities/wallet.entity";
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @InjectQueue("mail-processing") private readonly mailQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException("Email already in use");
    }

    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new ConflictException("Username already in use");
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
        currency: "NGN",
      });

      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      // Send welcome email in background
      await this.mailQueue.add("send-welcome-email", {
        email: savedUser.email,
        type: "WELCOME",
        data: { username: savedUser.username, fullName: savedUser.fullName },
      });

      const { accessToken, refreshToken } =
        await this.generateTokens(savedUser);

      await this.auditService.log(
        savedUser,
        "REGISTER",
        "User",
        savedUser.id,
        {
          email: savedUser.email,
          username: savedUser.username,
          fullName: savedUser.fullName,
        },
        null,
        ipAddress,
        userAgent,
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
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await this.auditService.log(
      user,
      "LOGIN",
      "User",
      user.id,
      null,
      null,
      ipAddress,
      userAgent,
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

  async requestPasswordReset(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Don't leak user existence
    if (!user) {
      return {
        message:
          "If an account exists with this email, a reset code has been sent.",
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 15 * 60; // 15 minutes

    await this.cacheManager.set(
      `password_reset:${dto.email}`,
      otp,
      ttl * 1000,
    );

    await this.mailQueue.add("send-reset-email", {
      email: dto.email,
      type: "PASSWORD_RESET",
      data: { otp, username: user.username, fullName: user.fullName },
    });

    return {
      message:
        "If an account exists with this email, a reset code has been sent.",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const storedOtp = await this.cacheManager.get(
      `password_reset:${dto.email}`,
    );
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException("Invalid or expired reset code");
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersService.update(user.id, { passwordHash });

    await this.cacheManager.del(`password_reset:${dto.email}`);

    await this.auditService.log(user, "PASSWORD_RESET", "User", user.id);

    return { message: "Password updated successfully" };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get("JWT_REFRESH_SECRET") ||
          this.configService.get("JWT_SECRET"),
      });

      const storedToken = await this.cacheManager.get(
        `refresh_token:${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    await this.cacheManager.del(`refresh_token:${userId}`);
    await this.auditService.log({ id: userId } as User, "LOGOUT", "User", userId);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get("JWT_REFRESH_SECRET") ||
        this.configService.get("JWT_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRY") || "30d",
    });

    const ttl = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    await this.cacheManager.set(`refresh_token:${user.id}`, refreshToken, ttl);

    return { accessToken, refreshToken };
  }
}
