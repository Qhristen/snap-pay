import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Decimal from "decimal.js";
import { User } from "../users/entities/user.entity";
import {
  TransactionFilterDto,
  TransactionTypeFilter,
} from "./dto/transaction-filter.dto";
import { Transaction } from "./entities/transaction.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async findAll(user: User, filter: TransactionFilterDto) {
    const { page, limit, type, startDate, endDate, status } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepo
      .createQueryBuilder("t")
      .where("t.userId = :userId", { userId: user.id });

    if (type && type !== TransactionTypeFilter.ALL) {
      if (type === TransactionTypeFilter.TRANSFER) {
        queryBuilder.andWhere("t.type IN (:...types)", {
          types: [
            TransactionTypeFilter.TRANSFER,
            TransactionTypeFilter.TRANSFER_SENT,
            TransactionTypeFilter.TRANSFER_RECEIVED,
          ],
        });
      } else {
        queryBuilder.andWhere("t.type = :type", { type });
      }
    }

    if (status) {
      queryBuilder.andWhere("t.status = :status", { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere("t.createdAt BETWEEN :start AND :end", {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere("t.createdAt >= :start", {
        start: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere("t.createdAt <= :end", { end: new Date(endDate) });
    }

    const [transactions, total] = await queryBuilder
      .orderBy("t.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      amount: parseFloat(new Decimal(t.amount).dividedBy(100).toFixed(2)),
    }));

    return {
      data: formattedTransactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
