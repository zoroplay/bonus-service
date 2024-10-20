import {JsonLogger, LoggerFactory} from "json-logger-service";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../../entity/bonus.entity";
import {CreateBonusResponse} from "../interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "../interfaces/get.bonus.request.interface";
import {DeleteBonusResponse} from "../interfaces/delete.bonus.response.interface";
import {GetBonusResponse} from "../interfaces/get.bonus.response.interface";
import {Userbonus} from "../../entity/userbonus.entity";
import {CheckDepositBonusRequest, GetUserBonusRequest} from "../interfaces/get.user.bonus.request.interface";
import {BonusTransaction, CheckDepositBonusResponse, GetUserBonusResponse, UserBonus} from "../interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "../interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "../interfaces/user.bonus.response.interface";
import {Repository} from "typeorm"
import {BonusStatusRequest} from "../interfaces/bonus.status.request.interface";
import {
    BONUS_TYPE_FREEBET, REFERENCE_TYPE_BONUS, TRANSACTION_TYPE_CREDIT
} from "../../constants";

import {Transactions} from "../../entity/transactions.entity";
import {
    AllCampaignBonus, CampaignBonusData,
    CreateCampaignBonusDto,
    DeleteCampaignBonusDto,
    GetCampaignDTO,
    RedeemCampaignBonusDto,
    UpdateCampaignBonusDto
} from "../interfaces/campaign.bonus.interface";
import {Campaignbonus} from "../../entity/campaignbonus.entity";
import any = jasmine.any;
import {Bonusbet} from "../../entity/bonusbet.entity";
import { TrackierService } from "./trackier.service";
import dayjs = require("dayjs");
import { WalletService } from "src/wallet/wallet.service";
import { IdentityService } from "src/identity/identity.service";
import { HttpStatus } from "@nestjs/common";
import { CreateBonusRequest, SearchBonusResponse, GetBonusByClientID } from "src/proto/bonus.pb";

export class BonusService {

    private readonly logger: JsonLogger = LoggerFactory.createLogger(BonusService.name);

    constructor(
        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

        @InjectRepository(Userbonus)
        private userBonusRepository: Repository<Userbonus>,

        @InjectRepository(Transactions)
        private transactionsRepository: Repository<Transactions>,

        @InjectRepository(Campaignbonus)
        private campaignBonusRepository: Repository<Campaignbonus>,

        @InjectRepository(Bonusbet)
        private bonusBetRepository: Repository<Bonusbet>,

        private trackierService: TrackierService,

        private walletService: WalletService,

        private identityService: IdentityService

    ) {}

    getTimestampInSeconds() : number {

        return Math.floor(Date.now() / 1000)
    }

    async searchBonus(payload: GetBonusByClientID): Promise<SearchBonusResponse> {
        try {
            const {searchKey, clientId} = payload;
            const data = [];

            const results = await this.bonusRepository.createQueryBuilder('bonus')
            .where('client_id = :clientId', {clientId})
            .andWhere('LOWER(name) like :key', {key: `%${searchKey}%`})
            .andWhere('status = :status', {status: 1})
            .getRawMany();

            for (const result of results) {
                data.push({
                    id: result.bonus_id,
                    name: result.bonus_name
                })
            };

            return {data};

        } catch (e) {
            console.log('error fetching bonus')
            return  {data: []}
        }
    }

    async getUserActiveBonus(payload: CheckDepositBonusRequest): Promise<CheckDepositBonusResponse> {
        try {
            const userBonus = await this.userBonusRepository.findOne({
                where: {
                    user_id: payload.userId,
                    client_id: payload.clientId,
                    status: 1
                },
            }); 
            let data = null;
            if (userBonus) {
                const bonus = await this.bonusRepository.findOne({where: {id: userBonus.bonus_id}});

                data = {
                    bonusId: bonus.id, 
                    value: bonus.bonus_amount,
                    type: bonus.product,
                    name: bonus.name,
                    gameId: bonus.game_id
                }
            }
            return {success: true, message: 'Active Bonus fetched', data};
        } catch (e) {
            return {success: false, message: 'Bonus request failed: ' + e.message};
        }
    }

    async create(data: CreateBonusRequest): Promise<CreateBonusResponse> {
        let bonusType = data.bonusType;

        // if(bonusType === BONUS_TYPE_FIRST_DEPOSIT) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;

        // }

        if(bonusType === BONUS_TYPE_FREEBET) {
            // no specific conditions
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            // data.resetIntervalType = ""
            data.minimumEntryAmount = 0
            data.rolloverCount = 0
        }

        // if(bonusType === BONUS_TYPE_REFERRAL) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;
        //     data.resetIntervalType = ""

        // }

        // if(bonusType === BONUS_TYPE_SHARE_BET) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;
        //     data.resetIntervalType = ""

        // }

        // if(bonusType === BONUS_TYPE_CASHBACK) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }

        //     if (data.minimumSelection < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum selections"
        //         }
        //     }

        //     // if (data.minimumLostGames < 1) {

        //     //     return {
        //     //         bonusId: 0,
        //     //         status: 401,
        //     //         description: "missing minimum lost games"
        //     //     }
        //     // }

        //     data.resetIntervalType = ""
        // }

        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        // if (data.bonusAmount == 0 && data.bonusAmountMultiplier == 0) {

        //     return {
        //         bonusId: 0,
        //         status: 401,
        //         description: "missing bonus amount"
        //     }
        // }

        // check if this bonus exists

        // let existingBonus = await this.bonusRepository.findOne({
        //     where: {
        //         client_id: data.clientId,
        //         bonus_type: data.bonusType,
        //     }
        // });

        // if (existingBonus !== null && existingBonus.id !== null && existingBonus.id > 0) {

        //     return {
        //         bonusId: existingBonus.id,
        //         status: 401,
        //         description: "Bonus type exists"
        //     }
        // }

        let bonus = new Bonus();
        bonus.bonus_type = data.bonusType
        bonus.client_id = data.clientId
        // bonus.minimum_stake = data.minimumStake
        bonus.duration = data.duration
        bonus.credit_type = data.creditType
        bonus.minimum_odds_per_event = data.minimumOddsPerEvent
        bonus.minimum_total_odds = data.minimumTotalOdds
        bonus.applicable_bet_type = data.applicableBetType
        bonus.maximum_winning = data.maximumWinning
        bonus.rollover_count = data.rolloverCount
        bonus.name = data.name
        // bonus.bonus_amount_multiplier = data.bonusAmountMultiplier
        bonus.status = 1
        bonus.product = data.product
        bonus.minimum_lost_games = data.minimumLostGames
        bonus.minimum_selection = data.minimumSelection
        // bonus.reset_interval_type = data.resetIntervalType
        bonus.minimum_entry_amount = data.minimumEntryAmount
        bonus.bonus_amount = data.bonusAmount
        bonus.max_amount = data.maxAmount
        bonus.game_id = data.gameId

        try {

            const bonusResult = await this.bonusRepository.save(bonus);

            if(data.product === 'casino') {
                
            }

            return {
                success: false,
                bonusId: bonusResult.id,
                status: 201,
                description: "Bonus created successfully",
            }

        } catch (e) {

            this.logger.error(" error creating bonus " + e.toString())
            throw e
        }
    }

    async update(data: CreateBonusRequest): Promise<CreateBonusResponse> {
        let bonusType = data.bonusType

        // if(bonusType === BONUS_TYPE_FIRST_DEPOSIT) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;

        // }

        // if(bonusType === BONUS_TYPE_FREEBET) {

        //     // no specific conditions
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;
        //     data.resetIntervalType = ""
        //     data.minimumEntryAmount = 0

        // }

        // if(bonusType === BONUS_TYPE_REFERRAL) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;
        //     data.resetIntervalType = ""

        // }

        // if(bonusType === BONUS_TYPE_SHARE_BET) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }
        //     data.minimumLostGames = 0;
        //     data.minimumSelection = 0;
        //     data.resetIntervalType = ""

        // }

        // if(bonusType === BONUS_TYPE_CASHBACK) {

        //     if (data.minimumEntryAmount < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum entry amount"
        //         }
        //     }

        //     if (data.minimumSelection < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum selections"
        //         }
        //     }

        //     if (data.minimumLostGames < 1) {

        //         return {
        //             bonusId: 0,
        //             status: 401,
        //             description: "missing minimum lost games"
        //         }
        //     }

        //     data.resetIntervalType = ""
        // }

        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }
        
        // check if this bonus exists

        let bonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                id: data.id,
            }
        });

        if (bonus === null || bonus.id === null || bonus.id === 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "Bonus type does not exists"
            }
        }

        try {

            const bonusResult = await this.bonusRepository.update(
                {
                    id: bonus.id,
                },
                {
                    bonus_type: data.bonusType,
                    client_id : data.clientId,
                    // minimum_stake : data.minimumStake,
                    duration : data.duration,
                    credit_type : data.creditType,
                    minimum_odds_per_event : data.minimumOddsPerEvent,
                    minimum_total_odds : data.minimumTotalOdds,
                    applicable_bet_type : data.applicableBetType,
                    maximum_winning : data.maximumWinning,
                    minimum_lost_games : data.minimumLostGames,
                    minimum_selection : data.minimumSelection,
                    // reset_interval_type : data.resetIntervalType,
                    minimum_entry_amount : data.minimumEntryAmount,
                    bonus_amount: data.bonusAmount,
                    rollover_count : data.rolloverCount,
                    name : data.name,
                    game_id : data.gameId,
                    max_amount : data.maxAmount,
                }
            )

            return {
                success: false,
                bonusId: bonus.id,
                status: 201,
                description: "Bonus updated successfully",
            }

        } catch (e) {

            this.logger.error(" error updating bonus " + e.toString())
            throw e
        }
    }

    async status(data: BonusStatusRequest): Promise<CreateBonusResponse> {

        // check if this bonus exists

        let bonus = await this.bonusRepository.findOne({
            where: {
                id: data.bonusId,
            }
        });

        if (bonus === null || bonus.id === null || bonus.id === 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "Bonus type does not exists"
            }
        }

        try {

            const bonusResult = await this.bonusRepository.update(
                {
                    id: bonus.id,
                },
                {
                    status: data.status
                }
            )

            return {
                success: true,
                bonusId: bonus.id,
                status: 201,
                description: "Bonus updated successfully",
            }

        } catch (e) {

            this.logger.error(" error updating bonus " + e.toString())
            throw e
        }
    }

    async delete(data: GetBonusRequest): Promise<DeleteBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.id == 0) {

            return {
                success: false,
                status: 401,
                description: "missing bonus id"
            }
        }

        // check if this bonus exists

        let bonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                id: data.id,
            }
        });

        if (bonus === null || bonus.id === null || bonus.id === 0) {

            return {
                success: false,
                status: 401,
                description: "Bonus type does not exists"
            }
        }

        try {

            const bonusResult = await this.bonusRepository.delete(
                {
                    id: bonus.id,
                }
            )

            return {
                success: true,
                status: 201,
                description: "Bonus deleted successfully",
            }

        } catch (e) {

            this.logger.error(" error deleting bonus " + e.toString())
            return {
                success: false,
                status: 501,
                description: " error deleting bonus " + e.toString(),
            }
        }

    }

    async all(data: GetBonusRequest): Promise<GetBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                bonus: []
            }
        }

        try {

            let bonus = await this.bonusRepository.find({
                where: {
                    client_id: data.clientId,
                }
            });

            let res = []

            for(const b of bonus) {

                let obj = {
                    "id": b.id,
                    "clientId": b.client_id,
                    "bonusType": b.bonus_type,
                    "minimumLostGames": b.minimum_lost_games,
                    "duration": b.duration,
                    "maxAmount": b.max_amount,
                    "minimumOddsPerEvent": b.minimum_odds_per_event,
                    "minimumTotalOdds": b.minimum_total_odds,
                    "applicableBetType": b.applicable_bet_type,
                    "maximumWinning": b.maximum_winning,
                    "bonusAmount": b.bonus_amount,
                    "status": b.status,
                    "created": b.created,
                    "updated": b.updated,
                    "minimumSelection" : b.minimum_selection,
                    "rolloverCount" : b.rollover_count,
                    "name" : b.name,
                    "creditType": b.credit_type,
                    "minimumEntryAmount": b.minimum_entry_amount,
                    "product": b.product,
                }

                res.push(obj)
            }

            return {
                bonus: res
            }

        } catch (e) {

            this.logger.error(" error getting all bonus " + e.toString())
            throw e
        }

    }

    async userBonus(data: GetUserBonusRequest): Promise<GetUserBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                bonus: []
            }
        }

        if (data.userId == 0) {

            return {
                bonus: []
            }
        }

        try {

            let bonus: Userbonus[]

            if(data.status > 0) {

                bonus = await this.userBonusRepository.find({
                    where: {
                        user_id: parseInt(""+data.userId),
                        client_id: parseInt(""+data.clientId),
                        status: data.status
                    }
                });
            }

            else if(data.id > 0) {

                bonus = await this.userBonusRepository.find({
                    where: {
                        user_id: parseInt(""+data.userId),
                        client_id: parseInt(""+data.clientId),
                        id: data.id
                    }
                });
            }

            // else if(data.bonusType.length > 0) {

            //     bonus = await this.userBonusRepository.find({
            //         where: {
            //             user_id: parseInt(""+data.userId),
            //             client_id: parseInt(""+data.clientId),
            //             bonus_type: data.bonusType
            //         }
            //     });

            // } 
            else {

                bonus = await this.userBonusRepository.find({
                    where: {
                        user_id: parseInt(""+data.userId),
                        client_id: parseInt(""+data.clientId),
                    },
                    order: {created: 'DESC'}
                });
            }

            let b = []

            for(const bon of bonus) {

                let usrBonus = {} as UserBonus
                usrBonus.bonusType = bon.bonus_type
                usrBonus.amount = bon.amount
                usrBonus.expiryDate = bon.expiry_date
                usrBonus.created = bon.created
                usrBonus.name = bon.name
                usrBonus.rolledAmount = bon.rolled_amount
                usrBonus.pendingAmount = bon.pending_amount
                usrBonus.totalRolloverCount = bon.rollover_count
                usrBonus.completedRolloverCount = bon.completed_rollover_count
                usrBonus.status = bon.status;

                // get transactions
                let transactions = await this.transactionsRepository.find({
                    where: {
                        user_bonus_id: bon.id
                    },
                    order: {created: 'DESC'}
                })

                let bonusTrans = [] as BonusTransaction[]

                for(const transaction of transactions) {

                    let bonusTran = {} as BonusTransaction
                    bonusTran.amount = transaction.amount
                    bonusTran.balance = transaction.balance;
                    bonusTran.desc = transaction.description
                    bonusTran.createdAt = transaction.created

                    bonusTrans.push(bonusTran)

                }

                usrBonus.transactions = bonusTrans

                b.push(usrBonus)
            }

            return {
                bonus: b
            }

        } catch (e) {

            this.logger.error(" error getting user bonus " + e.toString())

            return {
                bonus: null
            }
        }

    }

    async checkDepositBonus(param: CheckDepositBonusRequest): Promise<CheckDepositBonusResponse> {
        try {
            // console.log(param)
            let success, message, data;
            // check if user has an activate bonus
            const userBonus = await this.userBonusRepository.findOne({where: {
                user_id: param.userId,
                client_id: param.clientId,
                status: 1
            }});

            if (!userBonus) {
                // find first_deposit bonus
                const firstDeposit = await this.bonusRepository.findOne({where: {bonus_type: 'first_deposit', status: 1, client_id: param.clientId}});
                const deposit = await this.bonusRepository.findOne({where: {bonus_type: 'deposit', status: 1, client_id: param.clientId}});

                // get user details
                const userRes = await this.identityService.getDetails({
                    userId: param.userId, 
                    clientId: param.clientId
                });

                if (userRes.success) {

                    let user = userRes.data;

                    if (firstDeposit){ 
                        if (dayjs(user.registered).isBefore(firstDeposit.created)){
                            success = false; 
                            message = 'Not applicable'
                        } else {
                            // check if user has been awarded first_deposit bonus before
                            const userBonus = await this.userBonusRepository.findOne({where: {
                                user_id: param.userId,
                                client_id: param.clientId,
                                bonus_id: firstDeposit.id,
                            }});
                            if (userBonus) {
                                success = false; 
                                message = 'Bonus already used'
                            } else {
                                success = true;
                                message = 'Bonus available',
                                data = {
                                    bonusId: firstDeposit.id,
                                    value: firstDeposit.bonus_amount,
                                    type: firstDeposit.credit_type,
                                    name: firstDeposit.name
                                }

                                return {success, message, data};
                            }
                        }
                    }

                    if (deposit) {
                        // check if user has been awarded first_deposit bonus before
                        const userBonus = await this.userBonusRepository.findOne({where: {
                            user_id: param.userId,
                            client_id: param.clientId,
                            bonus_id: deposit.id,
                        }})

                        if (userBonus) {
                        success = false; 
                        message = 'Bonus already used'
                        } else {
                            success = true;
                            message = 'Bonus available',
                            data = {
                                bonusId: deposit.id,
                                value: deposit.bonus_amount,
                                type: deposit.credit_type,
                                name: deposit.name
                            }

                            return {success, message, data};
                        }
                    }
                }

                return {success, message, data};
            } else {
                return {success: false, message: 'User has an activte bonus'}
            }

        } catch(e) {
            console.log(e.message)
            return {success: false, message: 'Bonus request failed: ' + e.message};
        }
    }

    async awardBonus(data: AwardBonusRequest): Promise<UserBonusResponse> {
        // validations
        if (data.clientId == 0) {

            this.logger.error("missing clientID")

            return {
                status: 401,
                description: "missing client ID",
                bonus: null,
            }
        }

        if (data.bonusId == 0 || data.bonusId == 0) {

            this.logger.error("missing bonus ID")

            return {
                status: 401,
                description: "missing bonus Id",
                bonus: null,
            }
        }

        if (data.userId.length == 0) {

            this.logger.error("missing user ID")

            return {
                status: 401,
                description: "missing user ID",
                bonus: null,
            }
        }

        if (data.amount == 0 ) {

            this.logger.error("missing amount")

            return {
                status: 401,
                description: "missing amount",
                bonus: null,
            }
        }

        // console.log(data.bonusId);

        let existingBonus : Bonus = await this.bonusRepository.findOne({
            where: {
                id: data.bonusId,
            }
        });

        if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

            this.logger.error("Bonus type does not exist")

            return {
                status: 401,
                description: "bonus does not exist",
                bonus: null,
            }
        }

        let existingUserBonus = new Userbonus();

        let expiry = dayjs().add(existingBonus.duration, 'days').format('YYYY-MM-DD');

        let bonusAmount = data.amount

        if(existingBonus.max_amount > 0 && bonusAmount > existingBonus.max_amount ) {
            bonusAmount = existingBonus.max_amount;
        }

        existingUserBonus.client_id = data.clientId
        existingUserBonus.bonus_id = existingBonus.id;
        existingUserBonus.bonus_type = existingBonus.bonus_type
        existingUserBonus.amount = bonusAmount;
        existingUserBonus.balance = bonusAmount;
        existingUserBonus.expiry_date = expiry;
        existingUserBonus.rollover_count = existingBonus.rollover_count
        existingUserBonus.pending_amount = bonusAmount * existingBonus.rollover_count
        existingUserBonus.rolled_amount = 0
        existingUserBonus.completed_rollover_count = 0
        existingUserBonus.name = existingBonus.name;
        existingUserBonus.promoCode = data.promoCode;
        existingBonus.status = 1;

        try {

            let parts = data.userId.split(",")

            if(parts.length === 1) {

                let userId = parseInt(parts[0]);

                // check if user has an active bonus
                const activeBonus = await this.userBonusRepository.findOne({where: {
                        user_id: userId,
                        client_id: data.clientId,
                        status: 1
                    }
                });

                // do not grant bonus if user has an active bonus
                if (activeBonus)
                    return {
                        status: 401,
                        description: "User has an active bonus",
                        bonus: null,
                    }

                existingUserBonus.user_id = userId
                existingUserBonus.username = data.username;
                // check if user has been awarded this bonus before
                // const isAwarded = await this.userBonusRepository.findOne({
                //     where: {
                //         user_id: userId, 
                //         bonus_id: existingBonus.id
                //     }
                // });

                // if (!isAwarded) {

                    const bonusResult = await this.userBonusRepository.save(existingUserBonus);

                    // create transaction
                    let transaction =  new Transactions()
                    transaction.client_id = data.clientId
                    transaction.user_id = parseInt(data.userId)
                    transaction.amount = bonusAmount
                    transaction.balance = bonusAmount;
                    transaction.user_bonus_id = bonusResult.id
                    transaction.transaction_type = TRANSACTION_TYPE_CREDIT
                    transaction.reference_type = REFERENCE_TYPE_BONUS
                    transaction.reference_id = bonusResult.id
                    transaction.description = existingBonus.name+" awarded"
                    
                    await this.transactionsRepository.save(transaction);

                    let wallet = 'sport-bonus';
                    if (existingBonus.product === 'virtual') {
                        wallet = 'virtual';
                    } else if(existingBonus.product === 'casino') {
                        wallet = 'casino';
                    }

                    let creditPayload = {
                        amount: ''+bonusAmount,
                        userId: parseInt(data.userId),
                        clientId: data.clientId,
                        description: existingBonus.name + " awarded",
                        subject: existingBonus.name,
                        source: 'mobile',
                        wallet,
                        channel: 'Internal',
                        username: data.username
                    }

                    await this.walletService.credit(creditPayload);
                    // save trackier customer
                    if (data.promoCode)
                        this.trackierService.createCustomer(data);
                
                    return {
                        status: 201,
                        description: "bonus awarded successfully",
                        bonus: {
                            bonusType: bonusResult.bonus_type,
                            amount: bonusResult.amount,
                            expiryDate: bonusResult.expiry_date,
                            created: bonusResult.created
                        },
                    }
                // } else {
                //     return {
                //         status: 401,
                //         description: "User has already been awarded this bonus",
                //         bonus: null
                //     }
                // }

            } else {

                let i = 0;
                const usernames = data.username.split(',')
                for (const usr of parts) {
                    let userId = parseInt(usr);

                    // check if user has an active bonus
                    const activeBonus = await this.userBonusRepository.findOne({where: {
                            user_id: userId,
                            client_id: data.clientId,
                            status: 1
                        }
                    });
                    // do not grant bonus if user has an active bonus
                    if (activeBonus)
                        continue;

                    // check if user has been awarded this bonus before
                    // const isAwarded = await this.userBonusRepository.findOne({
                    //     where: {
                    //         user_id: userId, 
                    //         bonus_id: existingBonus.id
                    //     }
                    // });

                    
                        let existingUserBonus = new Userbonus();

                        existingUserBonus.client_id = data.clientId
                        existingUserBonus.bonus_id = existingBonus.id;
                        existingUserBonus.bonus_type = existingBonus.bonus_type
                        existingUserBonus.amount = bonusAmount;
                        existingUserBonus.balance = bonusAmount;
                        existingUserBonus.expiry_date = expiry;
                        existingUserBonus.rollover_count = existingBonus.rollover_count
                        existingUserBonus.pending_amount = bonusAmount * existingBonus.rollover_count
                        existingUserBonus.rolled_amount = 0
                        existingUserBonus.completed_rollover_count = 0
                        existingUserBonus.name = existingBonus.name;
                        existingUserBonus.promoCode = data.promoCode;
                        existingUserBonus.user_id = userId
                        existingUserBonus.username = usernames[i];
                        existingBonus.status = 1;

                        const bonusResult = await this.userBonusRepository.save(existingUserBonus);

                        // create transaction
                        let transaction =  new Transactions()
                        transaction.client_id = data.clientId
                        transaction.user_id = userId
                        transaction.amount = bonusAmount
                        transaction.balance = bonusAmount;
                        transaction.user_bonus_id = bonusResult.id
                        transaction.transaction_type = TRANSACTION_TYPE_CREDIT
                        transaction.reference_type = REFERENCE_TYPE_BONUS
                        transaction.reference_id = bonusResult.id
                        transaction.description = existingBonus.name+" awarded"
                        
                        await this.transactionsRepository.save(transaction)

                        let wallet = 'sport-bonus';
                        if (existingBonus.product === 'virtual') {
                            wallet = 'virtual';
                        } else if(existingBonus.product === 'casino') {
                            wallet = 'casino';
                        }

                        // send bonus credit
                            
                        let creditPayload = {
                            amount: ''+bonusAmount,
                            userId: userId,
                            clientId: data.clientId,
                            description: existingBonus.name + " awarded",
                            subject: existingBonus.name,
                            source: 'mobile',
                            wallet,
                            channel: 'Internal',
                            username: usernames[i]
                        }

                        await this.walletService.credit(creditPayload);
                        // save trackier customer
                        if (data.promoCode)
                            this.trackierService.createCustomer(data);
                    
                        
                    i++;
                }

                return {
                    status: HttpStatus.OK,
                    description: "bonus awarded successfully",
                    bonus: {
                        bonusType: existingUserBonus.bonus_type,
                        amount: existingUserBonus.amount,
                        expiryDateInTimestamp: existingUserBonus.expiry_date,
                        created: existingUserBonus.created
                    },
                }
            }

        } catch (e) {

            this.logger.error(" error awarding bonus " + e.toString())

            return {
                status: 500,
                description: "internal server error",
                bonus: null,
            }
        }
    }

    async createCampaignBonus(data: CreateCampaignBonusDto): Promise<CreateBonusResponse> {
        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.name.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus name"
            }
        }

        if (data.startDate.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus start date"
            }
        }


        if (data.endDate.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus end date"
            }
        }

        // check if this bonus exists

        let existingBonus = await this.campaignBonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_code: data.bonusCode,
            }
        });

        if (existingBonus !== null && existingBonus.id !== null && existingBonus.id > 0) {

            return {
                success: false,
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus code exists"
            }
        }

        const bonus = await this.bonusRepository.findOne({
            where: {id: data.bonusId}});

        let campaign = new Campaignbonus();
        campaign.bonus_code = data.bonusCode
        campaign.client_id = data.clientId
        campaign.bonus = bonus;
        campaign.start_date = data.startDate
        campaign.end_date = data.endDate
        campaign.name = data.name
        campaign.trackier_affiliate_ids = data.affiliateIds
        campaign.trackier_campaign_id = data.trackierCampaignId

        try {
            let description = 'campaign bonus created successfully'
            const bonusResult = await this.campaignBonusRepository.save(campaign)
            if (data.affiliateIds !== ''){
                // send campaign to trackier
                const res = await this.trackierService.createTrackierPromoCode(data);
                if (!res.success) {
                    description = "campaign bonus created successfully but unable to submit data to trackier"
                }
            }
            return {
                success: true,
                bonusId: bonusResult.id,
                status: 201,
                description,
            }

        } catch (e) {

            this.logger.error(" error creating campaign bonus " + e.toString())
            throw e
        }
    }

    async updateCampaignBonus(data: UpdateCampaignBonusDto): Promise<CreateBonusResponse> {
        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.id == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing  ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.name.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus name"
            }
        }

        if (!data.startDate ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus start date"
            }
        }

        if (!data.endDate ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus start date"
            }
        }

        // check if this bonus exists

        let existingBonus = await this.campaignBonusRepository.findOne({
            where: {
                client_id: data.clientId,
                id: data.id,
            }
        });

        if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

            return {
                success: false,
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus does not  exists"
            }
        }

        try {

            const bonus = await this.bonusRepository.findOneBy({id: data.bonusId});

            await this.campaignBonusRepository.update(
                {
                    id: existingBonus.id
                },
                {
                    bonus_code: data.bonusCode,
                    bonus,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    name: data.name
                }
            );

            return {
                success: true,
                bonusId:0,
                status: 201,
                description: "campaign bonus updated successfully",
            }

        } catch (e) {

            this.logger.error(" error updating campaign bonus " + e.toString())
            throw e
        }
    }

    async redeemCampaignBonus(data: RedeemCampaignBonusDto): Promise<CreateBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.userId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        // check if this bonus exists

        let existingBonus = await this.campaignBonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_code: data.bonusCode,
                status: 1,
            },
            relations: {
                bonus: true
            }
        });

        if (existingBonus !== null && existingBonus.id !== null && existingBonus.id > 0) {

            return {
                success: false,
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus code exists or is expired"
            }
        }

        // check if user is already awarded
        let existingUserBonus = await this.userBonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_id: existingBonus.bonus.id,
            }
        });

        if (existingUserBonus !== null && existingUserBonus.id !== null && existingUserBonus.id > 0) {

            return {
                success: false,
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus code already redeemed"
            }
        }


        // award bonus
        let request = {} as AwardBonusRequest
        request.userId = ""+data.userId
        request.clientId = data.clientId
        request.bonusId = existingBonus.bonus.id

        let res = await this.awardBonus(request)

        return {
            success: true,
            bonusId: res.bonus,
            status: res.status,
            description: res.description,
        }
    }

    async deleteCampaignBonus(data: DeleteCampaignBonusDto): Promise<CreateBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.id == 0) {

            return {
                success: false,
                bonusId: 0,
                status: 401,
                description: "missing bonus ID"
            }
        }

        try {

            // delete bonus
            await this.campaignBonusRepository.delete({
                client_id: data.clientId,
                id: data.id,
            });


            return {
                success: true,
                bonusId: 0,
                status: 201,
                description: "campaign bonus deleted successfully",
            }

        } catch (e) {

            this.logger.error(" error deleting campaign bonus " + e.toString())
            throw e
        }
    }

    async getCampaignBonus(data: GetBonusByClientID): Promise<AllCampaignBonus> {

        // validations
        if (data.clientId == 0) {

            return {
                bonus: []
            }
        }

        try {

            // delete bonus
            let campaigns = await this.campaignBonusRepository.find({
                where:{
                client_id: data.clientId,
            }});

            let res = []

            for(const campaign of campaigns) {

                let bonus = await this.bonusRepository.findOne({
                    where:{
                        id: campaign.bonus.id,
                    }});

                let bon = {} as any
                bon.id = bonus.id
                bon.clientId = bonus.client_id
                bon.bonusType = bonus.bonus_type
                bon.creditType = bonus.credit_type
                bon.duration = bonus.duration
                // bon.minimumEvents = bonus.minimum_events
                bon.minimumOddsPerEvent = bonus.minimum_odds_per_event
                bon.minimumTotalOdds = bonus.minimum_total_odds
                bon.applicableBetType = bonus.applicable_bet_type
                bon.maximumWinning = bonus.maximum_winning
                bon.minimumLostGames = bonus.minimum_lost_games
                bon.minimumSelection = bonus.minimum_selection
                bon.minimumEntryAmount = bonus.minimum_entry_amount
                bon.bonusAmount = bonus.bonus_amount
                bon.minimumSelection = bonus.minimum_selection
                bon.rolloverCount = bonus.rollover_count
                bon.name = bonus.name
                bon.maxAmount = bonus.max_amount

                let camp = {} as CampaignBonusData
                camp.id = campaign.id
                camp.bonusCode = campaign.bonus_code
                camp.clientId = campaign.client_id
                camp.name = campaign.name
                camp.startDate = campaign.start_date
                camp.endDate = campaign.end_date
                camp.bonus = bon
                res.push(camp)
            }

            return {
                bonus: res,
            }

        } catch (e) {

            this.logger.error(" error getting campaign bonus " + e.toString())
            throw e
        }
    }

    async getCampaign(data: GetCampaignDTO) {
        try {
            const {clientId, promoCode} = data;

            const campaign = await this.campaignBonusRepository.findOne({
                where: {
                    client_id: clientId,
                    bonus_code: promoCode
                },
                relations: {bonus: true}
            })
            
            if (campaign) {
                let bonus = await this.bonusRepository.findOne({
                    where:{
                        id: campaign.bonus.id,
                    }});

                let bon: any = {};
                bon.id = bonus.id
                bon.clientId = bonus.client_id
                bon.bonusType = bonus.bonus_type
                bon.creditType = bonus.credit_type
                bon.duration = bonus.duration
                // bon.minimumEvents = bonus.minimum_events
                bon.minimumOddsPerEvent = bonus.minimum_odds_per_event
                bon.minimumTotalOdds = bonus.minimum_total_odds
                bon.applicableBetType = bonus.applicable_bet_type
                bon.maximumWinning = bonus.maximum_winning
                bon.minimumLostGames = bonus.minimum_lost_games
                bon.minimumSelection = bonus.minimum_selection
                bon.minimumEntryAmount = bonus.minimum_entry_amount
                bon.bonusAmount = bonus.bonus_amount
                bon.minimumSelection = bonus.minimum_selection
                bon.rolloverCount = bonus.rollover_count
                bon.name = bonus.name
                bon.maxAmount = bonus.max_amount

                let camp = {} as CampaignBonusData
                camp.id = campaign.id
                camp.bonusCode = campaign.bonus_code
                camp.clientId = campaign.client_id
                camp.name = campaign.name
                camp.startDate = campaign.start_date
                camp.endDate = campaign.end_date
                camp.bonus = bon

                return {success: true, message: 'Campaign found', data: camp}
            } else {
                return {success: false, message: 'Campaign not found', data: null}
            }
        } catch (e) {
            return {success: false, message: 'Unable to fetch campaign', data: null}
        }
    }

    // async deactivateUserBonus(userId) {
    //     // get active bonus
    //     const userBonus = await this.userBonusRepository.findOne({
    //         where: {
    //             user_id: userId,
    //             status: 1
    //         }
    //     });

    //     if (userBonus) {
    //         // deactivate bonus to
    //         await this.userBonusRepository.update(
    //             {
    //                 status: 1,
    //                 user_id: userId
    //             },{
    //                 status: 2,
    //             }
    //         );

    //         if (userBonus.balance > 1) {
    //             // debit remaining bonus amount from user balance
    //             let debitPayload = {
    //                 amount: ''+userBonus.balance,
    //                 userId: userId,
    //                 clientId: userBonus.client_id,
    //                 description: userBonus.name + " deactivated",
    //                 subject: 'Bonus Deactivated',
    //                 source: 'mobile',
    //                 wallet: 'sport-bonus',
    //                 channel: 'Internal',
    //                 username: userBonus.username
    //             }

    //             await this.walletService.debit(debitPayload);
    //         }
    //     }
    // }

    async deletePlayerData(user_id) {
        await this.bonusBetRepository.delete({user_id});

        await this.userBonusRepository.delete({user_id});

        return {}
    }
}