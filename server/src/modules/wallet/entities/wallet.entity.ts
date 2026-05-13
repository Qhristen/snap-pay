import { ApiProperty } from '@nestjs/swagger';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
@Check(`"balance" >= 0`)
export class Wallet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  userId: string;

  @ApiProperty()
  @Column({
    type: 'bigint',
    default: '0',
    transformer: {
      to: (value: number) => value.toString(),
      from: (value: string) => parseInt(value, 10),
    },
  })
  @Transform(({ value }) => parseFloat((value / 100).toFixed(2)), { toPlainOnly: true })
  balance: number;

  @ApiProperty()
  @Column({ default: 'NGN' })
  currency: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (u) => u.wallet)
  @JoinColumn({ name: 'userId' })
  user: User;
}
