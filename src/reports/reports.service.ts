import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { DepositService } from 'src/consumers/workers/deposit.service';
import { Userbonus } from 'src/entity/userbonus.entity';
import { FetchReportRequest } from 'src/grpc/dto/bonus.dto';
import { Repository, Between } from 'typeorm';
import { bonusTypes } from '../../../gateway-service/src/bonus/dto/index';

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
    console.log(data);
    let userBonus = [];
    switch (data.bonusType) {
      case 'all':
        userBonus = await this.userBonusRepository.find({
          where: {
            created: Between(data.from, data.to),
          },
        });
        let alluserBonus = userBonus.map((bonus) => {
          return {
            ...bonus,
            wagering_requirement: bonus.rollover_count,
            wagering_requirement_remaining: bonus.pending_amount,
            wagering_requirement_achieved:
              bonus.rollover_count - bonus.completed_rollover_count,
          };
        });
        return {
          status: true,
          description: 'your bonus report',
          data: alluserBonus,
        };

      case data.bonusType:
        console.log(data.bonusType);
        userBonus = await this.userBonusRepository.find({
          where: {
            bonus_type: data.bonusType,
            created: Between(data.from, data.to),
          },
        });
        let newuserBonus = userBonus.map((bonus) => {
          return {
            ...bonus,
            wagering_requirement: bonus.rollover_count,
            wagering_requirement_remaining: bonus.pending_amount,
            wagering_requirement_achieved:
              bonus.rollover_count - bonus.completed_rollover_count,
          };
        });
        return {
          status: true,
          description: 'your bonus report',
          data: newuserBonus,
        };
    }
  }
}
