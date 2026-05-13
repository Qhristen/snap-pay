import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTransaction1778670068949 implements MigrationInterface {
    name = 'UpdateTransaction1778670068949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."transactions_type_enum" RENAME TO "transactions_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'TRANSFER_SENT', 'TRANSFER_RECEIVED')`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "public"."transactions_type_enum" USING "type"::"text"::"public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum_old" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "public"."transactions_type_enum_old" USING "type"::"text"::"public"."transactions_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transactions_type_enum_old" RENAME TO "transactions_type_enum"`);
    }

}
