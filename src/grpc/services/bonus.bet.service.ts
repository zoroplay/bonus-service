import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bonus } from 'src/entity/bonus.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { ValidateBetResponse } from '../interfaces/user.bet.interface';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Userbonus } from 'src/entity/userbonus.entity';
import { Transactions } from 'src/entity/transactions.entity';
import { Bonusbet } from 'src/entity/bonusbet.entity';
import { BET_CANCELLED, BET_PENDING, BET_VOIDED, BET_WINNING_ROLLBACK, BET_WON, REFERENCE_TYPE_CANCELBET, REFERENCE_TYPE_PLACEBET, REFERENCE_TYPE_WONBET, TRANSACTION_TYPE_CREDIT, TRANSACTION_TYPE_DEBIT } from 'src/constants';
import { PlaceBetResponse, SettleBetRequest, UserBet } from 'src/proto/bonus.pb';

@Injectable()
export class BonusBetService {


    private readonly logger: JsonLogger = LoggerFactory.createLogger(BonusBetService.name);

    constructor(

        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

        @InjectRepository(Userbonus)
        private userBonusRepository: Repository<Userbonus>,

        @InjectRepository(Transactions)
        private transactionsRepository: Repository<Transactions>,

        @InjectRepository(Bonusbet)
        private bonusBetRepository: Repository<Bonusbet>,
    ) {}

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

            if (data.selections.length == 0) {

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
                    id: userBonus.bonus_id,
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
            if(dayjs().isAfter(userBonus.expiry_date)) {

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

            if(data.stake < existingBonus.minimum_entry_amount) {

                return {
                    success: false,
                    message: "The minimum stake to use this bonus is "+existingBonus.minimum_entry_amount,
                    id: 0
                }
            }

            // check if user qualifies for bonus
            if(existingBonus.minimum_selection > data.selections.length) {

                this.logger.error("minimum_events rule violated")

                return {
                    success: false,
                    message: "The minimum selections must be "+existingBonus.minimum_selection+" events and above to use this bonus",
                    id: 0
                }
            }

            // validate odds
            //2. odds validation
            let selections = [];
            let totalOdds = 1;
            let userSelection = data.selections
            for (const selection of userSelection) {
                if(existingBonus.minimum_odds_per_event > 0 && existingBonus.minimum_odds_per_event > selection.odds) {

                    this.logger.error("minimum_odds_per_event rule violated")

                    return {
                        success: false,
                        message: "Each selections mush have a minimum of "+existingBonus.minimum_odds_per_event+" odds to use this bonus",
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

            if(existingBonus.minimum_total_odds > 0 && existingBonus.minimum_total_odds > totalOdds) {

                this.logger.error("minimum_total_odds rule violated")

                return {
                    success: false,
                    message: "You need at least total odds of "+existingBonus.minimum_total_odds+" to use this bonus",
                    id: 0
                }
            }
            
            return {success: true, id: userBonus.bonus_id, message: 'successful'}
           
        } catch (e) {
            console.log(e.message);
            return {success: false, id: 0, message: 'Error validating bonus bet '}
        }
    }
    
    async placeBet(data: UserBet): Promise<PlaceBetResponse> {

        // check if this bonus exists
        let userBonus = await this.userBonusRepository.findOne({
            where: {
                bonus_id: data.bonusId,
                user_id: data.userId,
                status: 1
            }
        });

        if (userBonus) {

            // check if this bonus exists
            let existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    id: data.bonusId,
                    status: 1
                }
            });

            let rollover_count = parseInt(userBonus.completed_rollover_count.toString()) + 1;
            // let pending_amount = userBonus.pending_amount  - data.stake;
            let rolled_amount = parseFloat(userBonus.used_amount.toString()) + parseFloat(data.stake.toString());
            let balance = userBonus.balance - data.stake;
            // console.log(balance);
            // deduct bonus
            await this.userBonusRepository.update(
                {
                    id: userBonus.id,
                },
                {
                    completed_rollover_count: rollover_count,
                    rolled_amount,
                    // pending_amount,
                    balance,
                    used_amount: parseFloat(userBonus.used_amount.toString()) + parseFloat(data.stake.toString()),
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
            let transaction                 = new Transactions()
            transaction.client_id           = data.clientId
            transaction.user_id             = data.userId
            transaction.amount              = data.stake
            transaction.balance             = balance;
            transaction.user_bonus_id       = userBonus.id
            transaction.transaction_type    = TRANSACTION_TYPE_DEBIT
            transaction.reference_type      = REFERENCE_TYPE_PLACEBET
            transaction.reference_id        = bonusBetResult.id
            transaction.description         = "Customer placed a bet using "+existingBonus.name+" bonus"
            
            await this.transactionsRepository.save(transaction)

            console.log('bonus bet placed')
            
            return {
                success: true,
                betId: data.betId,
                status: 200,
                statusDescription: "Bonus recorded successfully",
            }
        } else {
            return {
                success: false,
                betId: data.betId,
                status: 404,
                statusDescription: "Bonus not found",
            }
        }
    }

    async settleBet(data: SettleBetRequest) {
        try {

            const bet = await this.bonusBetRepository.findOne({where: {bet_id: data.betId}});
            let { amount } = data;
            if (bet) {
                const userBonus = await this.userBonusRepository.findOne({
                    where: {
                        id: bet.user_bonus_id,
                    }
                })

                const bonus = await this.bonusRepository.findOne({where: {id: userBonus.bonus_id}});

                // console.log('log', userBonus, bonus);
                // let amount = data.amount - bet.stake;
                if(amount > bonus.maximum_winning)
                    amount = bonus.maximum_winning;
                // const completed_rollover_count = bonus.completed_rollover_count + 1;
                let can_redeem = 0;

                if (userBonus.completed_rollover_count === userBonus.rollover_count && userBonus.pending_amount === 0) {
                    can_redeem = 1;
                }

                // update bet status
                await this.bonusBetRepository.update(
                    {
                        bet_id: data.betId,
                    }, {
                        status: data.status,
                    }
                );

                if (data.status === BET_WON) {
                    const balance = amount + parseFloat(''+userBonus.balance);
                    // console.log(balance, amount, userBonus.balance);
                    // create transaction
                    let transaction                 = new Transactions()
                    transaction.client_id           = data.clientId
                    transaction.user_id             = bet.user_id
                    transaction.amount              = amount
                    transaction.balance             = balance;
                    transaction.user_bonus_id       = userBonus.id
                    transaction.transaction_type    = TRANSACTION_TYPE_CREDIT
                    transaction.reference_type      = REFERENCE_TYPE_WONBET
                    transaction.reference_id        = bet.id
                    transaction.description         = "Customer won a bet using "+userBonus.name+" bonus"
                    //save transactions
                    await this.transactionsRepository.save(transaction);
                    let pending_amount = userBonus.pending_amount;
                    if (pending_amount >= 0)
                        pending_amount = parseFloat(''+userBonus.pending_amount) - amount
                    // update bonus status
                    await this.userBonusRepository.update(
                        {
                            id: userBonus.id
                        },{
                            balance,
                            can_redeem,
                            pending_amount: pending_amount
                            // status: 2
                        }
                    )

                } else if (data.status === BET_CANCELLED || data.status === BET_VOIDED || data.status === BET_WINNING_ROLLBACK) {
                    const balance = parseFloat(''+bet.stake) + parseFloat(''+userBonus.balance);
                    // create transaction
                    let transaction                 = new Transactions()
                    transaction.client_id           = data.clientId
                    transaction.user_id             = bet.user_id
                    transaction.amount              = bet.stake
                    transaction.balance             = balance;
                    transaction.user_bonus_id       = userBonus.id
                    transaction.transaction_type    = TRANSACTION_TYPE_CREDIT
                    transaction.reference_type      = REFERENCE_TYPE_CANCELBET
                    transaction.reference_id        = bet.id
                    transaction.description         = data.status === BET_WINNING_ROLLBACK ? "Winning rollback" : "Bet was cancelled"
                    //save transactions
                    await this.transactionsRepository.save(transaction);

                    // update bonus status
                    await this.userBonusRepository.update(
                        {
                            id: userBonus.id
                        },{
                            balance,
                            // pending_amount: parseFloat(''+userBonus.pending_amount) + parseFloat(''+bet.stake),
                            completed_rollover_count: userBonus.completed_rollover_count - 1,
                            rolled_amount: parseFloat(''+userBonus.rolled_amount) - parseFloat(''+bet.stake),
                            used_amount: parseFloat(''+userBonus.used_amount) - parseFloat(''+bet.stake)
                        }
                    )
                }
                return {success: true, message: 'bet updated', data: {amount}}
            } else {
                return {success: false, message: 'bet not found', data: {}}
            }
        } catch (e) {
            console.log(e.message);
            return {success: false, message: 'Unable to process request', data: {}}

        }
    }
   
}
