import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { DataSource } from "typeorm";
import { WalletGatewayService } from "../gateway/wallet-gateway.service";
import { AuditService } from "../audit/audit.service";
import { UsersService } from "../users/users.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("WalletService", () => {
  let service: WalletService;
  let dataSource: DataSource;
  let gatewayService: WalletGatewayService;
  let auditService: AuditService;
  let usersService: UsersService;

  const mockUser = { id: "user-1", username: "testuser" };
  const getMockWallet = (id = "wallet-1", userId = "user-1") => ({
    id,
    userId,
    balance: "100.00",
    currency: "USD",
  });
  const mockTransaction = {
    id: "txn-1",
    amount: "50.00",
    createdAt: new Date(),
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
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    dataSource = module.get<DataSource>(DataSource);
    gatewayService = module.get<WalletGatewayService>(WalletGatewayService);
    auditService = module.get<AuditService>(AuditService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe("deposit", () => {
    it("should successfully deposit funds", async () => {
      const wallet = getMockWallet();
      mockQueryRunner.manager.findOne.mockResolvedValue(wallet);
      mockQueryRunner.manager.findOneBy.mockResolvedValue({ id: 1 }); // Type
      mockQueryRunner.manager.save.mockResolvedValue({});

      const result = await service.deposit(mockUser as any, { amount: 50 });

      expect(result.balance).toBe("150.00");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
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
      mockQueryRunner.manager.findOneBy.mockResolvedValue({ id: 2 });
      mockQueryRunner.manager.save.mockResolvedValue({});

      const result = await service.withdraw(mockUser as any, { amount: 50 });

      expect(result.balance).toBe("50.00");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe("transfer", () => {
    it("should throw BadRequestException if transferring to self", async () => {
      await expect(
        service.transfer(mockUser as any, {
          recipientId: "user-1",
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully transfer funds", async () => {
      const mockRecipient = { id: "user-2", username: "recipient" };
      const wallet1 = getMockWallet("wallet-1", "user-1");
      const wallet2 = getMockWallet("wallet-2", "user-2");
      wallet2.balance = "0.00";

      mockUsersService.findById.mockResolvedValue(mockRecipient);
      // In transfer, we load based on sorted user ID
      // user-1 < user-2
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(wallet1);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(wallet2);
      mockQueryRunner.manager.findOneBy.mockResolvedValue({ id: 3 });

      const result = await service.transfer(mockUser as any, {
        recipientId: "user-2",
        amount: 50,
      });

      expect(result.senderBalance).toBe("50.00");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
