import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpcController } from './grpc.controller';
import { Bonus } from '../entity/bonus.entity';
import { Userbonus } from '../entity/userbonus.entity';
import { BonusService } from './services/bonus.service';
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
      Userbonus,
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
