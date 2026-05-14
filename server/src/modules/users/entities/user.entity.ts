import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Wallet } from "../../wallet/entities/wallet.entity";
import { AuditLog } from "../../audit/entities/audit-log.entity";
import { BankAccount } from "../../wallet/entities/bank-account.entity";

@Entity("users")
export class User {
  @ApiProperty({ description: "Unique identifier for the user", example: "uuid" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "User's email address", example: "user@example.com" })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: "Full name of the user", example: "John Doe" })
  @Column()
  fullName: string;

  @ApiProperty({ description: "Unique username", example: "johndoe" })
  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @ApiProperty({ description: "Account status", default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: "Timestamp when the user was created" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "Timestamp when the user was last updated" })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Wallet, (w) => w.user, { cascade: ["insert"] })
  wallet: Wallet;

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs: AuditLog[];

  @OneToMany(() => BankAccount, (ba) => ba.user)
  bankAccounts: BankAccount[];
}
