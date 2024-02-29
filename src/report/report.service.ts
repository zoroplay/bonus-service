import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { DepositService } from 'src/consumers/workers/deposit.service';
import { Between, EntityManager, Repository } from 'typeorm';
import { Userbonus } from 'src/entity/userbonus.entity';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ReportService {
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    DepositService.name,
  );

  constructor(
    @InjectRepository(Userbonus)
    private userBonusRepository: Repository<Userbonus>,
  ) {}

  @RabbitSubscribe({
    exchange: 'report_service.fetch_bonus',
    routingKey: 'report_service.fetch_bonus',
    queue: 'report_service.fetch_bonus',
    queueOptions: {
      channel: 'report_service.fetch_bonus',
      durable: true,
    },
    createQueueIfNotExists: true,
  })
  async fetchBonus(data: any) {
    try {
      if (data.bonus_type) {
        let userBonus = await this.userBonusRepository.find({
          where: {
            bonus_type: data.bonusType,
            created: Between(data.from, data.to),
          },
        });
        return userBonus;
      }
    } catch (error) {
      return { success: false, message: error.emssage };
    }
  }
}
