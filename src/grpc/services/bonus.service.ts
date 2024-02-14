import {JsonLogger, LoggerFactory} from "json-logger-service";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../../entity/bonus.entity";
import {CreateBonusRequest} from "../interfaces/create.bonus.request.interface";
import {CreateBonusResponse} from "../interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "../interfaces/get.bonus.request.interface";
import {DeleteBonusResponse} from "../interfaces/delete.bonus.response.interface";
import {GetBonusResponse} from "../interfaces/get.bonus.response.interface";
import {Userbonus} from "../../entity/userbonus.entity";
import {GetUserBonusRequest} from "../interfaces/get.user.bonus.request.interface";
import {BonusTransaction, GetUserBonusResponse, UserBetDTO, UserBonus} from "../interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "../interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "../interfaces/user.bonus.response.interface";
import {UserBet} from "../interfaces/user.bet.interface";
import {BonusResponse} from "../interfaces/has.bonus.response.interface";
import {MoreThanOrEqual, Repository} from "typeorm"
import {BonusStatusRequest} from "../interfaces/bonus.status.request.interface";
import {
    BONUS_TYPE_CASHBACK,
    BONUS_TYPE_FIRST_DEPOSIT,
    BONUS_TYPE_FREEBET,
    BONUS_TYPE_REFERRAL,
    BONUS_TYPE_SHARE_BET, REFERENCE_TYPE_BONUS, REFERENCE_TYPE_PLACEBET, TRANSACTION_TYPE_CREDIT, TRANSACTION_TYPE_DEBIT
} from "../../constants";
import axios from 'axios';

import {Transactions} from "../../entity/transactions.entity";
import {
    AllCampaignBonus, CampaignBonusData,
    CreateCampaignBonusDto,
    DeleteCampaignBonusDto, GetBonusByClientID,
    GetCampaignDTO,
    RedeemCampaignBonusDto,
    UpdateCampaignBonusDto
} from "../interfaces/campaign.bonus.interface";
import {Campaignbonus} from "../../entity/campaignbonus.entity";
import any = jasmine.any;
import {Bonusbet} from "../../entity/bonusbet.entity";
import { TrackierService } from "./trackier.service";

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

        private trackierService: TrackierService

    ) {

    }

    getTimestampInSeconds() : number {

        return Math.floor(Date.now() / 1000)
    }

    async create(data: CreateBonusRequest): Promise<CreateBonusResponse> {
        let bonusType = data.bonusType;

        if(bonusType === BONUS_TYPE_FIRST_DEPOSIT) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;

        }

        if(bonusType === BONUS_TYPE_FREEBET) {

            // no specific conditions
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""
            data.minimumEntryAmount = 0
            data.rolloverCount = 0
        }

        if(bonusType === BONUS_TYPE_REFERRAL) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""

        }

        if(bonusType === BONUS_TYPE_SHARE_BET) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""

        }

        if(bonusType === BONUS_TYPE_CASHBACK) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }

            if (data.minimumSelection < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum selections"
                }
            }

            // if (data.minimumLostGames < 1) {

            //     return {
            //         bonusId: 0,
            //         status: 401,
            //         description: "missing minimum lost games"
            //     }
            // }

            data.resetIntervalType = ""
        }

        // validations
        if (data.clientId == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusAmount == 0 && data.bonusAmountMultiplier == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus amount"
            }
        }

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
        bonus.minimum_stake = data.minimumStake
        bonus.expiry_in_hours = data.expiryInHours
        bonus.minimum_events = data.minimumEvents
        bonus.minimum_odds_per_event = data.minimumOddsPerEvent
        bonus.minimum_total_odds = data.minimumTotalOdds
        bonus.applicable_bet_type = data.applicableBetType
        bonus.maximum_winning = data.maximumWinning
        bonus.rollover_count = data.rolloverCount
        bonus.name = data.name
        bonus.bonus_amount_multiplier = data.bonusAmountMultiplier
        bonus.status = 1
        bonus.product = data.product
        bonus.minimum_lost_games = data.minimumLostGames
        bonus.minimum_selection = data.minimumSelection
        bonus.reset_interval_type = data.resetIntervalType
        bonus.minimum_entry_amount = data.minimumEntryAmount
        bonus.bonus_amount = data.bonusAmount
        bonus.minimum_betting_stake = data.minimumBettingStake

        try {

            const bonusResult = await this.bonusRepository.save(bonus)

            return {
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

        if(bonusType === BONUS_TYPE_FIRST_DEPOSIT) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;

        }

        if(bonusType === BONUS_TYPE_FREEBET) {

            // no specific conditions
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""
            data.minimumEntryAmount = 0

        }

        if(bonusType === BONUS_TYPE_REFERRAL) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""

        }

        if(bonusType === BONUS_TYPE_SHARE_BET) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }
            data.minimumLostGames = 0;
            data.minimumSelection = 0;
            data.resetIntervalType = ""

        }

        if(bonusType === BONUS_TYPE_CASHBACK) {

            if (data.minimumEntryAmount < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum entry amount"
                }
            }

            if (data.minimumSelection < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum selections"
                }
            }

            if (data.minimumLostGames < 1) {

                return {
                    bonusId: 0,
                    status: 401,
                    description: "missing minimum lost games"
                }
            }

            data.resetIntervalType = ""
        }

        // validations
        if (data.clientId == 0) {

            return {
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
                    minimum_stake : data.minimumStake,
                    expiry_in_hours : data.expiryInHours,
                    minimum_events : data.minimumEvents,
                    minimum_odds_per_event : data.minimumOddsPerEvent,
                    minimum_total_odds : data.minimumTotalOdds,
                    applicable_bet_type : data.applicableBetType,
                    maximum_winning : data.maximumWinning,
                    minimum_lost_games : data.minimumLostGames,
                    minimum_selection : data.minimumSelection,
                    reset_interval_type : data.resetIntervalType,
                    minimum_entry_amount : data.minimumEntryAmount,
                    bonus_amount: data.bonusAmount,
                    rollover_count : data.rolloverCount,
                    name : data.name,
                    bonus_amount_multiplier : data.bonusAmountMultiplier,
                    minimum_betting_stake : data.minimumBettingStake,
                }
            )

            return {
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


        // validations
        if (data.clientId == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusType.length == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus type"
            }
        }

        // check if this bonus exists

        let bonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: data.bonusType,
            }
        });

        if (bonus === null || bonus.id === null || bonus.id === 0) {

            return {
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
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusType.length == 0) {

            return {
                status: 401,
                description: "missing bonus type"
            }
        }

        // check if this bonus exists

        let bonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: data.bonusType,
            }
        });

        if (bonus === null || bonus.id === null || bonus.id === 0) {

            return {
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
                status: 201,
                description: "Bonus deleted successfully",
            }

        } catch (e) {

            this.logger.error(" error deleting bonus " + e.toString())
            throw e
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
                    "minimumStake": b.minimum_stake,
                    "expiryInHours": b.expiry_in_hours,
                    "minimumEvents": b.minimum_events,
                    "minimumOddsPerEvent": b.minimum_odds_per_event,
                    "minimumTotalOdds": b.minimum_total_odds,
                    "applicableBetType": b.applicable_bet_type,
                    "maximumWinning": b.maximum_winning,
                    "bonusAmount": b.bonus_amount,
                    "status": b.status,
                    "created": b.created,
                    "updated": b.updated,
                    "bonusAmountMultiplier" : b.bonus_amount_multiplier,
                    "rolloverCount" : b.rollover_count,
                    "name" : b.name,
                    "minimumBettingStake": b.minimum_betting_stake,
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
                    }
                });
            }

            let b = []

            for(const bon of bonus) {

                let usrBonus = {} as UserBonus
                usrBonus.bonusType = bon.bonus_type
                usrBonus.amount = bon.amount
                usrBonus.expiryDateInTimestamp = bon.expiry_date_in_timestamp
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
                    }
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

        let expiry = this.getTimestampInSeconds() + (existingBonus.expiry_in_hours * 60 * 60)

        let bonusAmount = data.amount

        if(data.baseValue > 0 ) {
            bonusAmount = data.baseValue * existingBonus.bonus_amount_multiplier
        }

        existingUserBonus.client_id = data.clientId
        existingUserBonus.bonus_id = existingBonus.id;
        existingUserBonus.bonus_type = existingBonus.bonus_type
        existingUserBonus.amount = bonusAmount;
        existingUserBonus.balance = bonusAmount;
        existingUserBonus.expiry_date_in_timestamp = expiry;
        existingUserBonus.rollover_count = existingBonus.rollover_count
        existingUserBonus.pending_amount = bonusAmount * existingBonus.rollover_count
        existingUserBonus.rolled_amount = 0
        existingUserBonus.completed_rollover_count = 0
        existingUserBonus.name = existingBonus.name;
        existingUserBonus.promoCode = data.promoCode;

        try {

            let parts = data.userId.split(",")

            if(parts.length === 1) {

                let userId = parseInt(parts[0])
                existingUserBonus.user_id = userId
                existingUserBonus.username = data.username

                const bonusResult = await this.userBonusRepository.save(existingUserBonus);

                if (data.promoCode)
                    this.trackierService.createCustomer(data);

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
                const transactionResult = await this.transactionsRepository.save(transaction)

                return {
                    status: 201,
                    description: "bonus awarded successfully",
                    bonus: {
                        bonusType: bonusResult.bonus_type,
                        amount: bonusResult.amount,
                        expiryDateInTimestamp: bonusResult.expiry_date_in_timestamp,
                        created: bonusResult.created
                    },
                }

            } else {

                for (const usr of parts) {

                    let userId = parseInt(usr)
                    existingUserBonus.user_id = userId

                    await this.userBonusRepository.save(existingUserBonus)
                }

                return {
                    status: 201,
                    description: "bonus awarded successfully",
                    bonus: {
                        bonusType: existingUserBonus.bonus_type,
                        amount: existingUserBonus.amount,
                        expiryDateInTimestamp: existingUserBonus.expiry_date_in_timestamp,
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
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.name.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus name"
            }
        }

        if (data.startDate.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus start date"
            }
        }


        if (data.endDate.length == 0 ) {

            return {
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

        try {

            const bonusResult = await this.campaignBonusRepository.save(campaign)
            if (data.affiliateIds !== ''){
                // send campaign to trackier
                const res = await this.trackierService.createTrackierPromoCode(data);
                if (!res.success) {
                    return {
                        bonusId: 0,
                        status: 400,
                        description: "unable to submit data to trackier"
                    }
                }
            }
            return {
                bonusId: bonusResult.id,
                status: 201,
                description: "campaign bonus created successfully",
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
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.id == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing  ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.name.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus name"
            }
        }

        if (data.startDate.length == 0 ) {

            return {
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
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus does not  exists"
            }
        }

        try {

            const bonus = await this.bonusBetRepository.findOneBy({id: data.bonusId});

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
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.bonusCode.length == 0 ) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus code"
            }
        }

        if (data.userId == 0) {

            return {
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
            bonusId: res.bonus,
            status: res.status,
            description: res.description,
        }
    }

    async deleteCampaignBonus(data: DeleteCampaignBonusDto): Promise<CreateBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing client ID"
            }
        }

        if (data.id == 0) {

            return {
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

                let bon = {} as CreateBonusRequest
                bon.id = bonus.id
                bon.clientId = bonus.client_id
                bon.bonusType = bonus.bonus_type
                bon.minimumStake = bonus.minimum_stake
                bon.expiryInHours = bonus.expiry_in_hours
                bon.minimumEvents = bonus.minimum_events
                bon.minimumOddsPerEvent = bonus.minimum_odds_per_event
                bon.minimumTotalOdds = bonus.minimum_total_odds
                bon.applicableBetType = bonus.applicable_bet_type
                bon.maximumWinning = bonus.maximum_winning
                bon.minimumLostGames = bonus.minimum_lost_games
                bon.minimumSelection = bonus.minimum_selection
                bon.minimumEntryAmount = bonus.minimum_entry_amount
                bon.bonusAmount = bonus.bonus_amount
                bon.bonusAmountMultiplier = bonus.id
                bon.rolloverCount = bonus.rollover_count
                bon.name = bonus.name
                bon.minimumBettingStake = bonus.minimum_betting_stake

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

                let bon = {} as CreateBonusRequest
                bon.id = bonus.id
                bon.clientId = bonus.client_id
                bon.bonusType = bonus.bonus_type
                bon.minimumStake = bonus.minimum_stake
                bon.expiryInHours = bonus.expiry_in_hours
                bon.minimumEvents = bonus.minimum_events
                bon.minimumOddsPerEvent = bonus.minimum_odds_per_event
                bon.minimumTotalOdds = bonus.minimum_total_odds
                bon.applicableBetType = bonus.applicable_bet_type
                bon.maximumWinning = bonus.maximum_winning
                bon.minimumLostGames = bonus.minimum_lost_games
                bon.minimumSelection = bonus.minimum_selection
                bon.minimumEntryAmount = bonus.minimum_entry_amount
                bon.bonusAmount = bonus.bonus_amount
                bon.bonusAmountMultiplier = bonus.id
                bon.rolloverCount = bonus.rollover_count
                bon.name = bonus.name
                bon.minimumBettingStake = bonus.minimum_betting_stake

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
}