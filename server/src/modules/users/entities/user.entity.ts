import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { BankAccount } from '../../wallet/entities/bank-account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Wallet, (w) => w.user, { cascade: ['insert'] })
  wallet: Wallet;

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs: AuditLog[];

  @OneToMany(() => BankAccount, (ba) => ba.user)
  bankAccounts: BankAccount[];
}
