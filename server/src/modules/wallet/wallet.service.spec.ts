import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { DataSource } from "typeorm";
import { WalletGatewayService } from "../gateway/wallet-gateway.service";
import { AuditService } from "../audit/audit.service";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";
import { getQueueToken } from "@nestjs/bullmq";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TransactionStatus, TransactionType } from "../../common/enums/transaction.enum";

describe("WalletService", () => {
  let service: WalletService;
  let dataSource: DataSource;
  let gatewayService: WalletGatewayService;
  let auditService: AuditService;
  let usersService: UsersService;
  let notificationsService: NotificationsService;
  let withdrawalQueue: any;
  let walletUpdatesQueue: any;

  const mockUser = { id: "user-1", username: "testuser", email: "test@example.com" };
  const getMockWallet = (id = "wallet-1", userId = "user-1") => ({
    id,
    userId,
    balance: 10000, // 100.00
    currency: "NGN",
  });
  const mockTransaction = {
    id: "txn-1",
    amount: 5000,
    createdAt: new Date(),
    userId: "user-1",
    reference: "TXN_123",
    status: TransactionStatus.SUCCESSFUL,
    type: TransactionType.DEPOSIT,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockReturnValue(mockTransaction),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockReturnValue({
      findOneBy: jest.fn(),
      save: jest.fn(),
    }),
  };

  const mockGatewayService = {
    emitBalanceUpdate: jest.fn(),
    emitTransferNotification: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: WalletGatewayService, useValue: mockGatewayService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: getQueueToken("withdrawal-processing"), useValue: mockQueue },
        { provide: getQueueToken("wallet-updates"), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    dataSource = module.get<DataSource>(DataSource);
    gatewayService = module.get<WalletGatewayService>(WalletGatewayService);
    auditService = module.get<AuditService>(AuditService);
    usersService = module.get<UsersService>(UsersService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    withdrawalQueue = module.get(getQueueToken("withdrawal-processing"));
    walletUpdatesQueue = module.get(getQueueToken("wallet-updates"));
  });

  describe("deposit", () => {
    it("should successfully deposit funds", async () => {
      const wallet = getMockWallet();
      mockQueryRunner.manager.findOne.mockResolvedValue(wallet);
      mockQueryRunner.manager.save.mockResolvedValue({});

      const result = await service.deposit(mockUser as any, { amount: 50 });

      expect(wallet.balance).toBe(15000); // 10000 + 5000
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(walletUpdatesQueue.add).toHaveBeenCalledWith("balance-update", expect.any(Object));
    });
  });

  describe("withdraw", () => {
    it("should throw BadRequestException if balance is insufficient", async () => {
      const wallet = getMockWallet();
      mockQueryRunner.manager.findOne.mockResolvedValue(wallet);

      await expect(
        service.withdraw(mockUser as any, { amount: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully withdraw funds", async () => {
      const wallet = getMockWallet();
      mockQueryRunner.manager.findOne.mockResolvedValue(wallet);
      mockQueryRunner.manager.save.mockResolvedValue({});

      const result = await service.withdraw(mockUser as any, { amount: 50 });

      expect(wallet.balance).toBe(5000); // 10000 - 5000
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe("transfer", () => {
    it("should throw BadRequestException if transferring to self", async () => {
      await expect(
        service.transfer(mockUser as any, {
          email: "test@example.com",
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully transfer funds", async () => {
      const mockRecipient = { id: "user-2", username: "recipient", email: "recipient@example.com" };
      const wallet1 = getMockWallet("wallet-1", "user-1");
      const wallet2 = getMockWallet("wallet-2", "user-2");
      wallet2.balance = 0;

      mockUsersService.findByEmail.mockResolvedValue(mockRecipient);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(wallet1);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(wallet2);

      const result = await service.transfer(mockUser as any, {
        email: "recipient@example.com",
        amount: 50,
      });

      expect(wallet1.balance).toBe(5000);
      expect(wallet2.balance).toBe(5000);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
