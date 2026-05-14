import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PaystackService } from "./paystack.service";
import { WalletService } from "../wallet/wallet.service";
import {
  TransactionStatus,
  TransactionType,
} from "../../common/enums/transaction.enum";
import { User } from "../users/entities/user.entity";
import { Transaction } from "../transactions/entities/transaction.entity";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
    @InjectQueue("withdrawal-processing")
    private readonly withdrawalQueue: Queue,
  ) {}

  async initializeFunding(
    user: User,
    amount: number,
    callbackUrl?: string,
  ) {
    const reference = this.paystackService.generateReference("FUND");
    const amountKobo = Math.round(amount * 100);

    // Create a pending transaction record
    await this.dataSource.getRepository(Transaction).save({
      userId: user.id,
      amount: amountKobo,
      reference,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      description: "Deposit via Paystack",
      metadata: {
        userId: user.id,
        type: "wallet_funding",
      },
    });

    const result = await this.paystackService.initializeTransaction(
      user.email,
      amount,
      reference,
      {
        type: "wallet_funding",
        userId: user.id,
      },
      callbackUrl,
    );

    return {
      authorizationUrl: result.authorization_url,
      accessCode: result.access_code,
      reference: result.reference,
    };
  }

  async initiateWithdrawal(
    user: User,
    amount: number,
    recipientCode: string,
    reference: string,
  ) {
    // Debit wallet first (creates pending transaction)
    const transaction = await this.walletService.debitWallet(
      user.id,
      amount,
      reference,
      TransactionType.WITHDRAWAL,
      "Wallet withdrawal",
    );

    // Queue for background processing
    await this.withdrawalQueue.add("process-withdrawal", {
      withdrawalId: transaction.id,
      userId: user.id,
      amount,
      recipientCode,
      reference,
    });

    return transaction;
  }
}
