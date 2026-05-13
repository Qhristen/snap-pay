import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("bank_accounts")
export class BankAccount {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  accountNumber: string;

  @ApiProperty()
  @Column()
  bankCode: string;

  @ApiProperty()
  @Column()
  bankName: string;

  @ApiProperty()
  @Column()
  accountName: string;

  @ApiProperty()
  @Column({ nullable: true })
  paystackRecipientCode: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.bankAccounts)
  @JoinColumn({ name: "userId" })
  user: User;
}
