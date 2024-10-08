import {
  RabbitMQChannelConfig,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQChannels } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces';
import { Bonus } from '../entity/bonus.entity';
import { Userbonus } from '../entity/userbonus.entity';
import { BetService } from './workers/bet.service';
import { DepositService } from './workers/deposit.service';
import { UserService } from './workers/user.service';
import { BonusService } from '../grpc/services/bonus.service';
import { Bonusbet } from '../entity/bonusbet.entity';
import { Campaignbonus } from '../entity/campaignbonus.entity';
import { Transactions } from '../entity/transactions.entity';

let exchanges = [];

let channels: RabbitMQChannels = {};

let defChannel: RabbitMQChannelConfig = {
  prefetchCount: 200,
  default: true,
};

channels['bonus_service'] = defChannel;

let names = ['first_deposit', 'new_user', 'share_bet', 'referral', 'cashback'];

for (const name of names) {
  let newName = 'bonus_service.' + name;

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
      Userbonus,
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
  providers: [
    ConsumerService,
    BetService,
    DepositService,
    UserService,
    BonusService,
  ],
  controllers: [ConsumerController],
})
export class ConsumerModule {}
