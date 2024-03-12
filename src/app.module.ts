import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import {ConsumerModule} from "./consumers/consumer.module";
import { TypeOrmModule } from '@nestjs/typeorm';
// import {RabbitmqModule} from "./rabbitmq.module";
import 'dotenv/config';
import { GrpcModule } from './grpc/grpc.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Bonus } from './entity/bonus.entity';
import { Cashback } from './entity/cashback.entity';
import { Firstdeposit } from './entity/firstdeposit.entity';
import { Freebet } from './entity/freebet.entity';
import { Lostbet } from './entity/lostbet.entity';
import { Referral } from './entity/referral.entity';
import { Sharebet } from './entity/sharebet.entity';
import { Userbonus } from './entity/userbonus.entity';
import { Bonusbet } from './entity/bonusbet.entity';
import { Campaignbonus } from './entity/campaignbonus.entity';
import { Transactions } from './entity/transactions.entity';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      // envFilePath: '.env',
      // ignoreEnvFile: false,
      isGlobal: true,
    }),
    // ConsumerModule,
    // RabbitmqModule,
    GrpcModule,
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
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
      ],
      //entities: [__dirname + '/entity/*.ts'],
      //entities: [__dirname + '/ ** / *.entity{.ts,.js}'],
      //entities: [__dirname + '/ ** / *.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Bonus,
      Userbonus,
      Transactions
    ]),
    WalletModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
