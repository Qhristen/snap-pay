import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['wallet'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ username });
  }

  async search(query: string, limit: number, excludeUserId: string): Promise<User[]> {
    return this.usersRepo.find({
      where: [
        { username: ILike(`%${query}%`), id: Not(excludeUserId) },
        { email: ILike(`%${query}%`), id: Not(excludeUserId) },
        { fullName: ILike(`%${query}%`), id: Not(excludeUserId) },
      ],
      take: limit,
      select: ['id', 'username', 'email', 'fullName'],
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async update(userId: string, data: Partial<User>): Promise<User> {
    const oldUser = await this.findById(userId);
    await this.usersRepo.update(userId, data);
    const updatedUser = await this.findById(userId);

    await this.auditService.log(
      updatedUser,
      'UPDATE_PROFILE',
      'User',
      userId,
      data,
      oldUser
    );

    return updatedUser;
  }
}
