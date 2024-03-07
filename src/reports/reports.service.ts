import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { DepositService } from 'src/consumers/workers/deposit.service';
import { Userbonus } from 'src/entity/userbonus.entity';
import { FetchReportRequest } from 'src/grpc/dto/bonus.dto';
import { Repository, Between } from 'typeorm';

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
    let userBonus = [];
    switch (data.bonusType) {
      case 'all':
        userBonus = await this.userBonusRepository.find({
          where: {
            created: Between(data.from, data.to),
          },
        });
        return {
          status: true,
          description: 'your bonus report',
          data: userBonus,
        };

      case data.bonusType:
        userBonus = await this.userBonusRepository.find({
          where: {
            bonus_type: data.bonusType,
            created: Between(data.from, data.to),
          },
        });
        return {
          status: true,
          message: 'your bonus report',
          data: userBonus,
        };
    }
  }
}
