import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpcController } from './grpc.controller';
import { Bonus } from '../entity/bonus.entity';
import { Userbonus } from '../entity/userbonus.entity';
import { BonusService } from './services/bonus.service';
import { Firstdeposit } from '../entity/firstdeposit.entity';
import { Freebet } from '../entity/freebet.entity';
import { Lostbet } from '../entity/lostbet.entity';
import { Referral } from '../entity/referral.entity';
import { Sharebet } from '../entity/sharebet.entity';
import { Cashback } from '../entity/cashback.entity';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Bonusbet } from '../entity/bonusbet.entity';
import { Campaignbonus } from '../entity/campaignbonus.entity';
import { Transactions } from '../entity/transactions.entity';
import { TrackierService } from './services/trackier.service';
import { BonusBetService } from './services/bonus.bet.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { IdentityModule } from 'src/identity/identity.module';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [
    IdentityModule,
    WalletModule,
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
    ClientsModule.register([
      {
        name: 'BETTING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'betting',
          protoPath: join(__dirname, '/proto/betting.proto'),
          url: process.env.BETTING_SERVICE_GRPC_URI,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'FEEDS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'protobuf',
          protoPath: join(__dirname, '/proto/odds.proto'),
          url: process.env.FEEDS_SERVICE_GRPC_URI,
        },
      },
    ]),
  ],
  controllers: [GrpcController],
  providers: [BonusBetService, BonusService, TrackierService, ReportsService],
})
export class GrpcModule {}
