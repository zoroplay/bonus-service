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
import {GetUserBonusResponse} from "../interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "../interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "../interfaces/user.bonus.response.interface";
import {UserBet} from "../interfaces/user.bet.interface";
import {HasBonusResponse} from "../interfaces/has.bonus.response.interface";
import {MoreThanOrEqual, Repository} from "typeorm"
import {BonusStatusRequest} from "../interfaces/bonus.status.request.interface";
import {
    BONUS_TYPE_CASHBACK,
    BONUS_TYPE_FIRST_DEPOSIT,
    BONUS_TYPE_FREEBET,
    BONUS_TYPE_REFERRAL,
    BONUS_TYPE_SHARE_BET
} from "../../constants";

export class BonusService {

    private readonly logger: JsonLogger = LoggerFactory.createLogger(BonusService.name);

    constructor(
        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

        @InjectRepository(Userbonus)
        private userBonusRepository: Repository<Userbonus>,

    ) {

    }

    getTimestampInSeconds() : number {

        return Math.floor(Date.now() / 1000)
    }

    async create(data: CreateBonusRequest, bonusType : string): Promise<CreateBonusResponse> {

        data.bonusType = bonusType


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

        if (data.bonusAmount == 0) {

            return {
                bonusId: 0,
                status: 401,
                description: "missing bonus amount"
            }
        }

        // check if this bonus exists

        let existingBonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: data.bonusType,
            }
        });

        if (existingBonus !== null && existingBonus.id !== null && existingBonus.id > 0) {

            return {
                bonusId: existingBonus.id,
                status: 401,
                description: "Bonus type exists"
            }
        }

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
        bonus.status = 1

        bonus.minimum_lost_games = data.minimumLostGames
        bonus.minimum_selection = data.minimumSelection
        bonus.reset_interval_type = data.resetIntervalType
        bonus.minimum_entry_amount = data.minimumEntryAmount
        bonus.bonus_amount = data.bonusAmount

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

    async update(data: CreateBonusRequest, bonusType : string): Promise<CreateBonusResponse> {

        data.bonusType = bonusType

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

            let bonus = await this.userBonusRepository.find({
                where: {
                    user_id: parseInt(""+data.userId),
                    client_id: parseInt(""+data.clientId),
                }
            });

            let b = []

            for(const bon of bonus) {

                b.push({
                    "bonusType": bon.bonus_type,
                    "amount": bon.amount,
                    "expiryDateInTimestamp": bon.expiry_date_in_timestamp,
                    "created": bon.created
                })
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

        if (data.bonusType.length == 0) {

            this.logger.error("missing bonus type")

            return {
                status: 401,
                description: "missing bonus type",
                bonus: null,
            }
        }

        if (data.userId == 0) {

            this.logger.error("missing user ID")

            return {
                status: 401,
                description: "missing user ID",
                bonus: null,
            }
        }

        if (data.amount == 0) {

            this.logger.error("missing amount")

            return {
                status: 401,
                description: "missing amount",
                bonus: null,
            }
        }

        // check if this bonus exists
        let existingBonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: data.bonusType,
            }
        });

        if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

            this.logger.error("Bonus type does not exist")

            return {
                status: 401,
                description: "bonus type does not exist",
                bonus: null,
            }
        }

        // check if this user bonus exists
        let existingUserBonus = await this.userBonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: data.bonusType,
                user_id: data.userId,
            }
        });

        if (existingUserBonus === null || existingUserBonus.id === null || existingUserBonus.id === 0) {

            existingUserBonus = new Userbonus();
            existingUserBonus.amount = 0
        }

        if(existingUserBonus.amount == null ) {

            existingUserBonus.amount = 0
        }

        let expiry = this.getTimestampInSeconds() + (existingBonus.expiry_in_hours * 60 * 60)

        existingUserBonus.user_id = data.userId
        existingUserBonus.client_id = data.clientId
        existingUserBonus.bonus_type = data.bonusType
        existingUserBonus.amount = parseFloat(""+existingUserBonus.amount) + parseFloat(""+data.amount);
        existingUserBonus.expiry_date_in_timestamp = expiry;

        try {

            const bonusResult = await this.userBonusRepository.save(existingUserBonus)

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

        } catch (e) {

            this.logger.error(" error creating bonus " + e.toString())

            return {
                status: 500,
                description: "internal server error",
                bonus: null,
            }
        }
    }

    async hasBonusBet(data: UserBet): Promise<HasBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                status: 401,
                description: "missing clientID",
                bonus: null
            }
        }

        if (data.userId == 0) {

            return {
                status: 401,
                description: "missing userID",
                bonus: null
            }
        }

        if (data.betslip.length == 0) {

            return {
                status: 401,
                description: "missing slips",
                bonus: null
            }
        }

        let existingBonus = new Bonus()
        let existingUserBonus = new Userbonus()

        if(data.bonusType.length > 0 ) {

            // check if this bonus exists
            existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: data.bonusType,
                    status: 1
                }
            });

            if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

                this.logger.error("Bonus type does not exist")

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }

            // check if this user has the supplied bonus
            let existingUserBonus = await this.userBonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: data.bonusType,
                    user_id: data.userId,
                }
            });

            if (existingUserBonus === null || existingUserBonus.id === null || existingUserBonus.id === 0) {

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }
        }

        if(data.bonusType.length === 0 || existingUserBonus.id === 0 ) {

            // check if this user bonus exists
            existingUserBonus = await this.userBonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    amount: MoreThanOrEqual(data.stake),
                    user_id: data.userId,
                    expiry_date_in_timestamp: MoreThanOrEqual(this.getTimestampInSeconds())
                },
                order: {
                    amount: "DESC",
                },
            });
        }

        if (existingUserBonus === null || existingUserBonus.id === null || existingUserBonus.id === 0) {

            return {
                status: 401,
                description: "bonus type does not exist",
                bonus: null
            }

        }

        if(existingUserBonus.expiry_date_in_timestamp < this.getTimestampInSeconds()) {

            return {
                status: 401,
                description: "bonus has expired",
                bonus: null
            }

        }

        if(existingBonus.id == 0 ) {

            // check if this bonus exists
            existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: existingUserBonus.bonus_type,
                    status: 1
                }
            });

            if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

                this.logger.error("Bonus type does not exist")

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }

        }

        // check if user qualifies for bonus

        if(existingBonus.minimum_events < data.betslip.length) {

            this.logger.error("minimum_events rule violated")

            return {
                status: 401,
                description: "You need atleast "+existingBonus.minimum_events+" events to use this bonus",
                bonus: null
            }
        }

        if(existingBonus.minimum_total_odds > 0 && existingBonus.minimum_total_odds < data.totalOdds) {

            this.logger.error("minimum_total_odds rule violated")

            return {
                status: 401,
                description: "You need atleast total odds of "+existingBonus.minimum_total_odds+" to use this bonus",
                bonus: null
            }
        }

        for(const slips of data.betslip) {

            if(existingBonus.minimum_odds_per_event > 0 && existingBonus.minimum_odds_per_event < slips.odds) {

                this.logger.error("minimum_odds_per_event rule violated")

                return {
                    status: 401,
                    description: "You need atleast odds of "+existingBonus.minimum_odds_per_event+" for each event to use this bonus",
                    bonus: null
                }
            }
        }

        // use qualifies for bonus

        let userBonus = new Userbonus()
        userBonus.amount = existingUserBonus.amount
        userBonus.id = existingUserBonus.id
        userBonus.bonus_type = existingUserBonus.bonus_type
        userBonus.expiry_date_in_timestamp = existingUserBonus.expiry_date_in_timestamp

        return {
            bonus: {
                "bonusType" : userBonus.bonus_type,
                "amount": userBonus.amount,
                "expiryDateInTimestamp": userBonus.expiry_date_in_timestamp,
                "created": userBonus.created,
            },
            status: 200,
            description: "User has active bonus",
        }
    }

    async debitBonusBet(data: UserBet): Promise<HasBonusResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                status: 401,
                description: "missing clientID",
                bonus: null
            }
        }

        if (data.userId == 0) {

            return {
                status: 401,
                description: "missing userID",
                bonus: null
            }
        }

        if (data.betslip.length == 0) {

            return {
                status: 401,
                description: "missing slips",
                bonus: null
            }
        }

        let existingBonus = new Bonus()
        let existingUserBonus = new Userbonus()

        if(data.bonusType.length > 0 ) {

            // check if this bonus exists
            existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: data.bonusType,
                    status: 1
                }
            });

            if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

                this.logger.error("Bonus type does not exist")

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }

            // check if this user has the supplied bonus
            let existingUserBonus = await this.userBonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: data.bonusType,
                    user_id: data.userId,
                }
            });

            if (existingUserBonus === null || existingUserBonus.id === null || existingUserBonus.id === 0) {

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }
        }

        if(data.bonusType.length === 0 || existingUserBonus.id === 0 ) {

            // check if this user bonus exists
            existingUserBonus = await this.userBonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    amount: MoreThanOrEqual(data.stake),
                    user_id: data.userId,
                    expiry_date_in_timestamp: MoreThanOrEqual(this.getTimestampInSeconds())
                },
                order: {
                    amount: "DESC",
                },
            });
        }

        if (existingUserBonus === null || existingUserBonus.id === null || existingUserBonus.id === 0) {

            return {
                status: 401,
                description: "bonus type does not exist",
                bonus: null
            }

        }

        if(existingUserBonus.expiry_date_in_timestamp < this.getTimestampInSeconds()) {

            return {
                status: 401,
                description: "bonus has expired",
                bonus: null
            }

        }

        if(existingBonus.id == 0 ) {

            // check if this bonus exists
            existingBonus = await this.bonusRepository.findOne({
                where: {
                    client_id: data.clientId,
                    bonus_type: existingUserBonus.bonus_type,
                    status: 1
                }
            });

            if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

                this.logger.error("Bonus type does not exist")

                return {
                    status: 401,
                    description: "bonus type does not exist",
                    bonus: null
                }

            }

        }

        // check if user qualifies for bonus

        if(existingBonus.minimum_events < data.betslip.length) {

            this.logger.error("minimum_events rule violated")

            return {
                status: 401,
                description: "You need atleast "+existingBonus.minimum_events+" events to use this bonus",
                bonus: null
            }
        }

        if(existingBonus.minimum_total_odds > 0 && existingBonus.minimum_total_odds < data.totalOdds) {

            this.logger.error("minimum_total_odds rule violated")

            return {
                status: 401,
                description: "You need atleast total odds of "+existingBonus.minimum_total_odds+" to use this bonus",
                bonus: null
            }
        }

        for(const slips of data.betslip) {

            if(existingBonus.minimum_odds_per_event > 0 && existingBonus.minimum_odds_per_event < slips.odds) {

                this.logger.error("minimum_odds_per_event rule violated")

                return {
                    status: 401,
                    description: "You need atleast odds of "+existingBonus.minimum_odds_per_event+" for each event to use this bonus",
                    bonus: null
                }
            }
        }

        // use qualifies for bonus

        // deduct bonus
        await this.userBonusRepository.update(
            {
                id: existingUserBonus.id,
            },
            {
                amount: existingUserBonus.amount - data.stake,
            });

        let userBonus = new Userbonus()
        userBonus.amount = data.stake
        userBonus.id = existingUserBonus.id
        userBonus.bonus_type = existingUserBonus.bonus_type
        userBonus.expiry_date_in_timestamp = existingUserBonus.expiry_date_in_timestamp


        return {
            bonus: {
                "bonusType" : userBonus.bonus_type,
                "amount": existingUserBonus.amount - data.stake,
                "expiryDateInTimestamp": userBonus.expiry_date_in_timestamp,
                "created": userBonus.created,
            },
            status: 201,
            description: "Bonus debited successfully",
        }
    }

}