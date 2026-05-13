import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  TransactionStatus,
  TransactionType,
} from "../../../common/enums/transaction.enum";

@Entity("transactions")
@Index(["reference"], { unique: true })
export class Transaction {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ unique: true })
  reference: string;

  @ApiProperty()
  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value.toString(),
      from: (value: string) => parseInt(value, 10),
    },
  })
  @Transform(({ value }) => parseFloat((value / 100).toFixed(2)), {
    toPlainOnly: true,
  })
  amount: number;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ enum: TransactionStatus })
  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiProperty({ required: false })
  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ enum: TransactionType })
  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;
}
