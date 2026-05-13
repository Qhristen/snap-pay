import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1778643355884 implements MigrationInterface {
    name = 'UpdateUser1778643355884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "accountNumber" character varying NOT NULL, "bankCode" character varying NOT NULL, "bankName" character varying NOT NULL, "accountName" character varying NOT NULL, "paystackRecipientCode" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
    }

}
