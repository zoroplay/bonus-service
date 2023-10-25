import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {Injectable} from "@nestjs/common";
import {DepositService} from "./workers/deposit.service";
import {UserService} from "./workers/user.service";
import {BetService} from "./workers/bet.service";

@Injectable()
export class ConsumerService {

    constructor(
        private readonly depositService: DepositService,
        private readonly userService: UserService,
        private readonly betService: BetService,
    ) {
    }

    @RabbitSubscribe({
        exchange: 'bonus_service.first_deposit',
        routingKey: 'bonus_service.first_deposit',
        queue: 'bonus_service.first_deposit',
        queueOptions: {
            channel: 'bonus_service.first_deposit',
            durable: true,
        },
        createQueueIfNotExists: true,
    })
    public async processFirstDeposit(msg: {}) {

        await this.depositService.firstUserDeposit(msg);
        return
    }

    @RabbitSubscribe({
        exchange: 'bonus_service.new_user',
        routingKey: 'bonus_service.new_user',
        queue: 'bonus_service.new_user',
        queueOptions: {
            channel: 'bonus_service.new_user',
            durable: true,
        },
        createQueueIfNotExists: true,
    })
    public async processNewUserBonus(msg: {}) {

        await this.userService.newUser(msg);
        return
    }

    @RabbitSubscribe({
        exchange: 'bonus_service.referral',
        routingKey: 'bonus_service.referral',
        queue: 'bonus_service.referral',
        queueOptions: {
            channel: 'bonus_service.referral',
            durable: true,
        },
        createQueueIfNotExists: true,
    })
    public async processReferralBonus(msg: {}) {

        await this.userService.referral(msg);
        return
    }

    @RabbitSubscribe({
        exchange: 'bonus_service.share_bet',
        routingKey: 'bonus_service.share_bet',
        queue: 'bonus_service.share_bet',
        queueOptions: {
            channel: 'bonus_service.share_bet',
            durable: true,
        },
        createQueueIfNotExists: true,
    })
    public async processShareBet(msg: {}) {

        await this.betService.shareBet(msg);
        return
    }

    @RabbitSubscribe({
        exchange: 'bonus_service.cashback',
        routingKey: 'bonus_service.cashback',
        queue: 'bonus_service.cashback',
        queueOptions: {
            channel: 'bonus_service.cashback',
            durable: true,
        },
        createQueueIfNotExists: true,
    })
    public async processCashback(msg: {}) {

        await this.betService.cashback(msg);
        return
    }

}