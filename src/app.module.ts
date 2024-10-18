import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import {ConsumerModule} from "./consumers/consumer.module";
// import {RabbitmqModule} from "./rabbitmq.module";
import 'dotenv/config';
import { GrpcModule } from './grpc/grpc.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Bonus } from './entity/bonus.entity';
import { Userbonus } from './entity/userbonus.entity';
import { Transactions } from './entity/transactions.entity';
import { WalletModule } from './wallet/wallet.module';
import typeorm from './db/typeorm';
import { Bonusbet } from './entity/bonusbet.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    // ConsumerModule,
    // RabbitmqModule,
    GrpcModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    TypeOrmModule.forFeature([
      Bonus,
      Bonusbet,
      Userbonus,
      Transactions
    ]),
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
