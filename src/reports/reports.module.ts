import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bonus } from 'src/entity/bonus.entity';
import { Bonusbet } from 'src/entity/bonusbet.entity';
import { Campaignbonus } from 'src/entity/campaignbonus.entity';
import { Cashback } from 'src/entity/cashback.entity';
import { Firstdeposit } from 'src/entity/firstdeposit.entity';
import { Freebet } from 'src/entity/freebet.entity';
import { Lostbet } from 'src/entity/lostbet.entity';
import { Referral } from 'src/entity/referral.entity';
import { Sharebet } from 'src/entity/sharebet.entity';
import { Transactions } from 'src/entity/transactions.entity';
import { Userbonus } from 'src/entity/userbonus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bonus,
      Firstdeposit,
      Freebet,
      Lostbet,
      Referral,
      Sharebet,
      Userbonus,
      Cashback,
      Bonusbet,
      Campaignbonus,
      Transactions,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
