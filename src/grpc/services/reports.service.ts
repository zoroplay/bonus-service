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
            client_id: data.clientID
          },
        });

        let alluserBonus = userBonus.map((bonus) => {
          return {
            ...bonus,
            userId: bonus.user_id,
            clientId: bonus.client_id,
            bonusId: bonus.bonus_id,
            bonusType: bonus.bonus_type,
            expiryDate: bonus.expiry_date,
            usedAmount: bonus.used_amount,
            wageringRequirement: bonus.rollover_count,
            wageringRequirementRemaining: bonus.pending_amount,
            wageringRequirementAchieved:
              bonus.rollover_count - bonus.completed_rollover_count,
          };
        });
        return {
          status: true,
          message: 'your bonus report',
          data: alluserBonus,
        };

      case data.bonusType:
        userBonus = await this.userBonusRepository.find({
          where: {
            bonus_type: data.bonusType,
            created: Between(data.from, data.to),
            client_id: data.clientID
          },
        });
        let newuserBonus = userBonus.map((bonus) => {
          return {
            ...bonus,
            userId: bonus.user_id,
            clientId: bonus.client_id,
            bonusId: bonus.bonus_id,
            bonusType: bonus.bonus_type,
            expiryDate: bonus.expiry_date,
            usedAmount: bonus.used_amount,
            wageringRequirement: bonus.rollover_count,
            wageringRequirementRemaining: bonus.pending_amount,
            wageringRequirementAchieved:
              bonus.rollover_count - bonus.completed_rollover_count,
          };
        });
        return {
          status: true,
          message: 'your bonus report',
          data: newuserBonus,
        };
    }
  }
}
