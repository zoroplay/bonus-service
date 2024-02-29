import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { DepositService } from 'src/consumers/workers/deposit.service';
import { Userbonus } from 'src/entity/userbonus.entity';
import { Repository, Between } from 'typeorm';
import { FetchReportRequest } from 'src/wallet/wallet.pb';
import { FetchReportResponse } from '../../dist/wallet/wallet.pb';

@Injectable()
export class ReportsService {
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    DepositService.name,
  );

  constructor(
    @InjectRepository(Userbonus)
    private userBonusRepository: Repository<Userbonus>,
  ) {}

  async fetchBonus(data: FetchReportRequest) {
    if (data.bonusType) {
      let userBonus = await this.userBonusRepository.find({
        where: {
          bonus_type: data.bonusType,
          created: Between(data.from, data.to),
        },
      });
      return {
        status: true,
        description: 'your bonus report',
        data: userBonus,
      };
    }
  }
}
