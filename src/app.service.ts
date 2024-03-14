import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Bonus } from './entity/bonus.entity';
import { Repository } from 'typeorm';
import { Userbonus } from './entity/userbonus.entity';
import { Transactions } from './entity/transactions.entity';
import * as dayjs from 'dayjs';
import { REFERENCE_TYPE_WONBET, TRANSACTION_TYPE_DEBIT } from './constants';
import { WalletService } from './wallet/wallet.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Bonus)
    private bonusRepository: Repository<Bonus>,

    @InjectRepository(Userbonus)
    private userBonusRepository: Repository<Userbonus>,

    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,

    private readonly walletService: WalletService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredBonus() {
    console.log('running cronjob to check expiry')
    try {
      const date = dayjs().format('YYYY-MM-DD');
      const playerBonuses = await this.userBonusRepository.createQueryBuilder('bonus')  
                .where('expiry_date < :date', {date})
                .andWhere('status = :status', {status: 1})
                .getMany();

      for (const bonus of playerBonuses) {
        // update status
        await this.userBonusRepository.update(
          {id: bonus.id},
          {status: 2}
        );
        // create transaction
        let transaction                 = new Transactions()
        transaction.client_id           = bonus.client_id
        transaction.user_id             = bonus.user_id
        transaction.amount              = bonus.balance
        transaction.balance             = 0;
        transaction.user_bonus_id       = bonus.id
        transaction.transaction_type    = TRANSACTION_TYPE_DEBIT
        transaction.reference_type      = REFERENCE_TYPE_WONBET
        transaction.reference_id        = bonus.bonus_id
        transaction.description         = `${bonus.name} expired`
        
        await this.transactionsRepository.save(transaction);

        let debitPayload = {
            // currency: clientSettings.currency,
            amount: bonus.balance,
            userId: bonus.user_id,
            username: bonus.username,
            clientId: bonus.client_id,
            subject: "Bonus Expired",
            description: `${bonus.name} expired`,
            source: 'internal',
            wallet: 'sport-bonus',
            channel: 'Internal'
            // transaction_type: TRANSACTION_TYPE_PLACE_BET
        }

        // console.log(debitPayload)

        await this.walletService.debit(debitPayload);

      }

    } catch (e) {
      console.log('error running expired check', e.message);
    }
  }
}
