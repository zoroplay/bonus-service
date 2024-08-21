import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedTable1724214712456 implements MigrationInterface {
    name = 'UpdatedTable1724214712456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`expiry_in_hours\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`minimum_betting_stake\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`minimum_events\``);
        await queryRunner.query(`ALTER TABLE \`userbonus\` DROP COLUMN \`expiry_date_in_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bonus_id\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`product\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`max_amount\` decimal(20,2) NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`duration\` int NOT NULL DEFAULT '24'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`credit_type\` varchar(100) NULL DEFAULT 'flat'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`game_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` ADD \`start_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` ADD \`end_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` ADD \`trackier_campaign_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` ADD \`trackier_affiliate_ids\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`userbonus\` ADD \`username\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`userbonus\` ADD \`expiry_date\` varchar(255) NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`userbonus\` ADD \`promoCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`userbonus\` ADD \`can_redeem\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`user_bonus_id\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`balance\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`bonus\` CHANGE \`minimum_odds_per_event\` \`minimum_odds_per_event\` decimal(20,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` CHANGE \`minimum_total_odds\` \`minimum_total_odds\` decimal(20,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX \`IDX_91a877f529d7aefec02b95b585\` ON \`bonus\` (\`product\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5b2642688c57074480c3a0d579\` ON \`bonus\` (\`max_amount\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2a46e2399d1d9d861b18d5ae56\` ON \`bonus\` (\`duration\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5cf509a7e3d89f21f29f74f9b5\` ON \`bonus\` (\`credit_type\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_217f26bb23573f8cc3c083dd68\` ON \`bonus\` (\`game_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_468fef4a3fdd8ff06e81ec473e\` ON \`campaignbonus\` (\`start_date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8125af96b1eb19d93c5111324c\` ON \`campaignbonus\` (\`end_date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_206d8686ef0d63b7a6af2930ed\` ON \`campaignbonus\` (\`trackier_campaign_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cc01477bf449bdb0b18d8eb884\` ON \`campaignbonus\` (\`trackier_affiliate_ids\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_deadb2a4d6bfca8ecbc25e64e3\` ON \`userbonus\` (\`username\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f8d5711440b6eb23967e9b2892\` ON \`userbonus\` (\`expiry_date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_97628da614c9a7dfe850bffb4f\` ON \`userbonus\` (\`promoCode\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1e3af62d9afd4554ea03b99050\` ON \`userbonus\` (\`can_redeem\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_76a4540d6cc60e16baa25e735b\` ON \`transactions\` (\`user_bonus_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d64e9412df3532ee8201d6421b\` ON \`transactions\` (\`balance\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f86799ee7d9a00fdbf3bc00ca2\` ON \`bonusbet\` (\`bet_id\`)`);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` ADD CONSTRAINT \`FK_08f96fb8c52827ac045b606c388\` FOREIGN KEY (\`bonus_id\`) REFERENCES \`bonus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` DROP FOREIGN KEY \`FK_08f96fb8c52827ac045b606c388\``);
        await queryRunner.query(`DROP INDEX \`IDX_f86799ee7d9a00fdbf3bc00ca2\` ON \`bonusbet\``);
        await queryRunner.query(`DROP INDEX \`IDX_d64e9412df3532ee8201d6421b\` ON \`transactions\``);
        await queryRunner.query(`DROP INDEX \`IDX_76a4540d6cc60e16baa25e735b\` ON \`transactions\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e3af62d9afd4554ea03b99050\` ON \`userbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_97628da614c9a7dfe850bffb4f\` ON \`userbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_f8d5711440b6eb23967e9b2892\` ON \`userbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_deadb2a4d6bfca8ecbc25e64e3\` ON \`userbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_cc01477bf449bdb0b18d8eb884\` ON \`campaignbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_206d8686ef0d63b7a6af2930ed\` ON \`campaignbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_8125af96b1eb19d93c5111324c\` ON \`campaignbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_468fef4a3fdd8ff06e81ec473e\` ON \`campaignbonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_217f26bb23573f8cc3c083dd68\` ON \`bonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_5cf509a7e3d89f21f29f74f9b5\` ON \`bonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_2a46e2399d1d9d861b18d5ae56\` ON \`bonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b2642688c57074480c3a0d579\` ON \`bonus\``);
        await queryRunner.query(`DROP INDEX \`IDX_91a877f529d7aefec02b95b585\` ON \`bonus\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` CHANGE \`minimum_total_odds\` \`minimum_total_odds\` decimal(20,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` CHANGE \`minimum_odds_per_event\` \`minimum_odds_per_event\` decimal(20,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`user_bonus_id\``);
        await queryRunner.query(`ALTER TABLE \`userbonus\` DROP COLUMN \`can_redeem\``);
        await queryRunner.query(`ALTER TABLE \`userbonus\` DROP COLUMN \`promoCode\``);
        await queryRunner.query(`ALTER TABLE \`userbonus\` DROP COLUMN \`expiry_date\``);
        await queryRunner.query(`ALTER TABLE \`userbonus\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` DROP COLUMN \`trackier_affiliate_ids\``);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` DROP COLUMN \`trackier_campaign_id\``);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` DROP COLUMN \`end_date\``);
        await queryRunner.query(`ALTER TABLE \`campaignbonus\` DROP COLUMN \`start_date\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`game_id\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`credit_type\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`max_amount\``);
        await queryRunner.query(`ALTER TABLE \`bonus\` DROP COLUMN \`product\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`bonus_id\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`userbonus\` ADD \`expiry_date_in_timestamp\` bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`minimum_events\` int NOT NULL DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`minimum_betting_stake\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`bonus\` ADD \`expiry_in_hours\` int NOT NULL DEFAULT '24'`);
    }

}
