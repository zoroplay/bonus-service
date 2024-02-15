import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bonus } from 'src/entity/bonus.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { UserBet, ValidateBetResponse } from '../interfaces/user.bet.interface';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { ClientGrpc } from '@nestjs/microservices';
import OddsService, {
    GetOddsReply,
    GetOddsRequest,
    ProducerstatusreplyInterface
} from "../interfaces/odds.service.interface";
import BettingService, {PlaceBetRequest, PlaceBetResponse} from "../interfaces/betting.service.interface";
import { Userbonus } from 'src/entity/userbonus.entity';
import { Transactions } from 'src/entity/transactions.entity';
import { Bonusbet } from 'src/entity/bonusbet.entity';
import { BonusService } from './bonus.service';
import { BET_PENDING, REFERENCE_TYPE_PLACEBET, TRANSACTION_TYPE_DEBIT } from 'src/constants';

@Injectable()
export class BonusBetService  implements OnModuleInit{


    private oddsService: OddsService;
    private bettingService: BettingService;
    private readonly logger: JsonLogger = LoggerFactory.createLogger(BonusBetService.name);

    constructor(
        private readonly bonusService: BonusService,

        @Inject('FEEDS_SERVICE')
        private readonly oddsClient: ClientGrpc,

        @Inject('BETTING_SERVICE')
        private readonly client: ClientGrpc,

        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

        @InjectRepository(Userbonus)
        private userBonusRepository: Repository<Userbonus>,

        @InjectRepository(Transactions)
        private transactionsRepository: Repository<Transactions>,

        @InjectRepository(Bonusbet)
        private bonusBetRepository: Repository<Bonusbet>,
    ) {}

    onModuleInit(): any {

        this.oddsService = this.oddsClient.getService<OddsService>('Odds');
        this.bettingService = this.client.getService<BettingService>('BettingService');

    }

    async validateBet(data: UserBet): Promise<ValidateBetResponse> {
        try {
            // validations
            if (data.clientId == 0) {

                return {
                    success: false,
                    message: "missing clientID",
                    id: 0
                }
            }

            if (data.bonusId == 0) {

                return {
                    success: false,
                    message: "missing bonus ID",
                    id: 0
                }
            }

            if (data.userId == 0) {

                return {
                    success: false,
                    message: "missing userID",
                    id: 0
                }
            }

            if (data.betslip.length == 0) {

                return {
                    success: false,
                    message: "missing slips",
                    id: 0
                }
            }

            // check if this bonus exists
            const userBonus = await this.userBonusRepository.findOne({
                where: {
                    user_id: data.userId,
                    client_id: data.clientId,
                    status: 1
                }
            });

            if (userBonus === null || userBonus.id === null || userBonus.id === 0) {

                this.logger.error("userBonus type does not exist")

                return {
                    success: false,
                    message: "bonus type does not exist or is expired",
                    id: 0
                }
            }

            // check if this bonus exists
            let existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    id: data.bonusId,
                    status: 1
                }
            });

            if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

                this.logger.error("Bonus type does not exist")

                return {
                    success: false,
                    message: "bonus type does not exist",
                    id: 0
                }

            }

            // check if bonus is expired
            if(userBonus.expiry_date_in_timestamp < this.bonusService.getTimestampInSeconds()) {

                return {
                    success: false,
                    message: "bonus has expired",
                    id: 0
                }

            }


            // validate stake
            if(data.stake > userBonus.balance) {

                return {
                    success: false,
                    message: "You have insufficient bonus balance to place a bet of "+data.stake+". Your bonus balance is "+userBonus.balance,
                    id: 0
                }

            }

            if(data.stake < existingBonus.minimum_betting_stake) {

                return {
                    success: false,
                    message: "Your stake of "+data.stake+" is below the minimum betting stake for this bonus. Place a bet with a stake of at least "+existingBonus.minimum_betting_stake,
                    id: 0
                }
            }

            // check if user qualifies for bonus
            if(existingBonus.minimum_events < data.betslip.length) {

                this.logger.error("minimum_events rule violated")

                return {
                    success: false,
                    message: "You need atleast "+existingBonus.minimum_events+" events to use this bonus",
                    id: 0
                }
            }

            // validate odds
            //2. odds validation
            let selections = [];
            let totalOdds = 1;
            let userSelection = data.betslip

            for (const selection of userSelection) {

                if(existingBonus.minimum_odds_per_event > 0 && existingBonus.minimum_odds_per_event < selection.odds) {

                    this.logger.error("minimum_odds_per_event rule violated")

                    return {
                        success: false,
                        message: "You need at least odds of "+existingBonus.minimum_odds_per_event+" for each event to use this bonus",
                        id: 0
                    }
                }


                selections.push({
                    event_name: selection.eventName,
                    event_type: selection.eventType,
                    event_prefix: "sr",
                    producer_id: selection.producerId,
                    sport_id: selection.sportId,
                    event_id: selection.eventId,
                    market_id: selection.marketId,
                    market_name: selection.marketName,
                    specifier: selection.specifier,
                    outcome_name: selection.outcomeName,
                    outcome_id: selection.outcomeId,
                    odds: selection.odds,
                })

                totalOdds = totalOdds * selection.odds
            }

            if (selections.length === 0)
                return {success: false, message: "missing selections", id: 0};

            if(existingBonus.minimum_total_odds > 0 && existingBonus.minimum_total_odds < totalOdds) {

                this.logger.error("minimum_total_odds rule violated")

                return {
                    success: false,
                    message: "You need at least total odds of "+existingBonus.minimum_total_odds+" to use this bonus",
                    id: 0
                }
            }
            
            return {success: true, id: userBonus.bonus_id, message: 'successful'}
           
        } catch (e) {
            return {success: false, id: 0, message: 'Error validating bonus bet'}
        }
    }
    
    async placeBet(data: UserBet): Promise<PlaceBetResponse> {

        // check if this bonus exists
        let userBonus = await this.userBonusRepository.findOne({
            where: {
                id: data.bonusId,
                user_id: data.userId,
                status: 1
            }
        });

        // check if this bonus exists
        let existingBonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                id: data.bonusId,
                status: 1
            }
        });

        // let rollover_count = userBonus.completed_rollover_count + 1;
        // let pending_amount = userBonus.pending_amount  - data.stake;
        // let rolled_amount = userBonus.rolled_amount + data.stake;
        let balance = userBonus.balance - data.stake;

        // deduct bonus
        await this.userBonusRepository.update(
            {
                id: userBonus.id,
            },
            {
                // completed_rollover_count: rollover_count,
                // rolled_amount: rolled_amount,
                // pending_amount: pending_amount,
                balance,
                used_amount: userBonus.used_amount + data.stake,
            });

        // create bet
        let bonusBet = new Bonusbet();
        bonusBet.bet_id = data.betId
        bonusBet.user_id = data.userId
        bonusBet.client_id = data.clientId
        bonusBet.bonus_type = existingBonus.bonus_type
        bonusBet.stake = data.stake
        bonusBet.status = BET_PENDING
        bonusBet.user_bonus_id = userBonus.id
        // bonusBet.rollover_count = rollover_count
        // bonusBet.rolled_amount = rolled_amount
        // bonusBet.pending_amount = pending_amount
        
        const bonusBetResult = await this.bonusBetRepository.save(bonusBet)

        // create transaction
        let transaction =  new Transactions()
        transaction.client_id = data.clientId
        transaction.user_id = data.userId
        transaction.amount = data.stake
        transaction.balance = balance;
        transaction.user_bonus_id = userBonus.id
        transaction.transaction_type = TRANSACTION_TYPE_DEBIT
        transaction.reference_type = REFERENCE_TYPE_PLACEBET
        transaction.reference_id = bonusBetResult.id
        transaction.description = "Customer placed a bet using "+existingBonus.name+" bonus"
        const transactionResult = await this.transactionsRepository.save(transaction)

        return {
            betId: data.betId,
            status: 200,
            statusDescription: "Bonus recorded successfully",
        }

        

    }
   
}