import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "./payment.service";
import { PaystackService } from "./paystack.service";
import { WalletService } from "../wallet/wallet.service";
import { DataSource } from "typeorm";
import { getQueueToken } from "@nestjs/bullmq";
import { BadRequestException } from "@nestjs/common";
import { TransactionType, TransactionStatus } from "../../common/enums/transaction.enum";

describe("PaymentService", () => {
  let service: PaymentService;
  let paystackService: jest.Mocked<PaystackService>;
  let walletService: jest.Mocked<WalletService>;
  let dataSource: jest.Mocked<DataSource>;
  let withdrawalQueue: any;

  const mockUser = {
    id: "user-uuid",
    email: "test@example.com",
    fullName: "Test User",
  };

  const mockPaystackResult = {
    authorization_url: "https://paystack.com/auth",
    access_code: "abc",
    reference: "FUND_123",
  };

  const mockTransaction = {
    id: "txn-uuid",
    userId: "user-uuid",
    amount: 500000,
    reference: "FUND_123",
    status: TransactionStatus.PENDING,
  };

  const mockWallet = {
    id: "wallet-uuid",
    userId: "user-uuid",
    balance: 1000000,
    availableBalance: 1000000,
    bankAccount: {
      paystackRecipientCode: "RCP_123",
    },
  };

  beforeEach(async () => {
    const mockPaystackService = {
      generateReference: jest.fn().mockReturnValue("FUND_123"),
      initializeTransaction: jest.fn().mockResolvedValue(mockPaystackResult),
      verifyTransaction: jest.fn(),
      verifyBankAccount: jest.fn(),
      listBanks: jest.fn(),
      createTransferRecipient: jest.fn(),
    };

    const mockWalletService = {
      creditWallet: jest.fn(),
      debitWallet: jest.fn(),
      getBalance: jest.fn(),
      getWallet: jest.fn(),
      updateBankAccount: jest.fn(),
      updatePaystackRecipientCode: jest.fn(),
      listBankAccounts: jest.fn(),
    };

    const mockRepository = {
      save: jest.fn().mockResolvedValue(mockTransaction),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaystackService, useValue: mockPaystackService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: getQueueToken("withdrawal-processing"), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paystackService = module.get(PaystackService);
    walletService = module.get(WalletService);
    dataSource = module.get(DataSource);
    withdrawalQueue = module.get(getQueueToken("withdrawal-processing"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("initializeFunding", () => {
    it("should initialize funding successfully", async () => {
      const amount = 5000;
      const result = await service.initializeFunding(mockUser as any, amount);

      expect(dataSource.getRepository).toHaveBeenCalled();
      expect(paystackService.initializeTransaction).toHaveBeenCalledWith(
        mockUser.email,
        amount,
        "FUND_123",
        expect.any(Object),
        undefined,
      );
      expect(result).toEqual({
        authorizationUrl: mockPaystackResult.authorization_url,
        accessCode: mockPaystackResult.access_code,
        reference: mockPaystackResult.reference,
      });
    });
  });

  describe("verifyFunding", () => {
    it("should verify funding successfully", async () => {
      const reference = "FUND_123";
      const paystackVerifyResult = {
        status: "success",
        amount: 500000, // in kobo
        metadata: { userId: mockUser.id },
      };

      paystackService.verifyTransaction.mockResolvedValue(paystackVerifyResult as any);
      walletService.creditWallet.mockResolvedValue(mockTransaction as any);
      walletService.getBalance.mockResolvedValue({ balance: 10000 } as any);

      const result = await service.verifyFunding(mockUser as any, reference);

      expect(paystackService.verifyTransaction).toHaveBeenCalledWith(reference);
      expect(walletService.creditWallet).toHaveBeenCalledWith(
        mockUser.id,
        5000,
        reference,
      );
      expect(result.amount).toBe(5000);
    });

    it("should throw BadRequestException if payment failed", async () => {
      paystackService.verifyTransaction.mockResolvedValue({ status: "failed" } as any);

      await expect(service.verifyFunding(mockUser as any, "ref")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if payment belongs to another user", async () => {
      paystackService.verifyTransaction.mockResolvedValue({
        status: "success",
        metadata: { userId: "other-user" },
      } as any);

      await expect(service.verifyFunding(mockUser as any, "ref")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("initiateWithdrawal", () => {
    it("should initiate withdrawal successfully", async () => {
      const amount = 5000;
      walletService.getWallet.mockResolvedValue(mockWallet as any);
      walletService.debitWallet.mockResolvedValue(mockTransaction as any);
      walletService.getBalance.mockResolvedValue({ balance: 5000 } as any);

      const result = await service.initiateWithdrawal(mockUser as any, amount);

      expect(walletService.debitWallet).toHaveBeenCalled();
      expect(withdrawalQueue.add).toHaveBeenCalled();
      expect(result.amount).toBe(amount);
      expect(result.reference).toBeDefined();
    });

    it("should throw BadRequestException if balance is insufficient", async () => {
      walletService.getWallet.mockResolvedValue({ ...mockWallet, availableBalance: 1000 } as any);

      await expect(service.initiateWithdrawal(mockUser as any, 5000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if no bank account is linked", async () => {
      walletService.getWallet.mockResolvedValue({ ...mockWallet, bankAccount: null } as any);

      await expect(service.initiateWithdrawal(mockUser as any, 5000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
