import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import {
  RabbitMQChannelConfig,
  RabbitMQChannels,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
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

let exchanges = [];
let channels: RabbitMQChannels = {};

let defChannel: RabbitMQChannelConfig = {
  prefetchCount: 200,
  default: true,
};

channels['report_service'] = defChannel;

let names = ['fetchBonus'];

for (const name of names) {
  let newName = 'report_service.' + name;

  exchanges.push({
    name: newName,
    type: 'direct',
  });

  channels[newName] = {
    prefetchCount: 200,
  };
}

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
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: exchanges,
      uri: process.env.RABITTMQ_URI,
      channels: channels,
      defaultRpcTimeout: 15000,
      connectionInitOptions: {
        timeout: 50000,
      },
    }),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
