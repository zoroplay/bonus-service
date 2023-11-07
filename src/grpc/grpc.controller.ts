import {Controller, Inject, OnModuleInit} from "@nestjs/common";
import {ClientGrpc, GrpcMethod} from "@nestjs/microservices";
import {GetUserBonusRequest} from "./interfaces/get.user.bonus.request.interface";
import {CreateBonusRequest} from "./interfaces/create.bonus.request.interface";
import {CreateBonusResponse} from "./interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "./interfaces/get.bonus.request.interface";
import {GetBonusResponse} from "./interfaces/get.bonus.response.interface";
import {DeleteBonusResponse} from "./interfaces/delete.bonus.response.interface";
import {GetUserBonusResponse} from "./interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "./interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "./interfaces/user.bonus.response.interface";
import {BonusService} from "./services/bonus.service";
import {UserBet} from "./interfaces/user.bet.interface";
import {BonusResponse} from "./interfaces/has.bonus.response.interface";
import {BonusStatusRequest} from "./interfaces/bonus.status.request.interface";
import OddsService, {
    GetOddsReply,
    GetOddsRequest,
    ProducerstatusreplyInterface
} from "./interfaces/odds.service.interface";
import BettingService, {PlaceBetRequest, PlaceBetResponse} from "./interfaces/betting.service.interface";

import {
    BET_PENDING,
    BONUS_TYPE_CASHBACK,
    BONUS_TYPE_FIRST_DEPOSIT,
    BONUS_TYPE_FREEBET,
    BONUS_TYPE_REFERRAL,
    BONUS_TYPE_SHARE_BET, REFERENCE_TYPE_PLACEBET, TRANSACTION_TYPE_DEBIT
} from "../constants";
import {JsonLogger, LoggerFactory} from "json-logger-service";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../entity/bonus.entity";
import {Repository} from "typeorm";
import {Userbonus} from "../entity/userbonus.entity";
import {Transactions} from "../entity/transactions.entity";
import {Observable} from "rxjs";
import {Bonusbet} from "../entity/bonusbet.entity";
import {
    AllCampaignBonus,
    CreateCampaignBonusDto,
    DeleteCampaignBonusDto, GetBonusByClientID,
    RedeemCampaignBonusDto,
    UpdateCampaignBonusDto
} from "./interfaces/campaign.bonus.interface";

@Controller()
export class GrpcController implements OnModuleInit  {

    private oddsService: OddsService;
    private bettingService: BettingService;
    private readonly logger: JsonLogger = LoggerFactory.createLogger(GrpcController.name);

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

    ) {
    }

    onModuleInit(): any {

        this.oddsService = this.oddsClient.getService<OddsService>('Odds');
        this.bettingService = this.client.getService<BettingService>('BettingService');

    }

    @GrpcMethod('BonusService', 'CreateCashbackBonus')
    CreateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.create(data,BONUS_TYPE_CASHBACK)

    }

    @GrpcMethod('BonusService', 'UpdateCashbackBonus')
    UpdateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.update(data,BONUS_TYPE_CASHBACK)

    }

    @GrpcMethod('BonusService', 'CreateFirstDepositBonus')
    CreateFirstDepositBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.create(data,BONUS_TYPE_FIRST_DEPOSIT)

    }

    @GrpcMethod('BonusService', 'UpdateFirstDepositBonus')
    UpdateFirstDepositBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.update(data,BONUS_TYPE_FIRST_DEPOSIT)

    }

    @GrpcMethod('BonusService', 'CreateFreebetBonus')
    CreateFreebetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.create(data,BONUS_TYPE_FREEBET)

    }

    @GrpcMethod('BonusService', 'UpdateFreebetBonus')
    UpdateFreebetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.update(data,BONUS_TYPE_FREEBET)

    }

    @GrpcMethod('BonusService', 'CreateReferralBonus')
    CreateReferralBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.create(data,BONUS_TYPE_REFERRAL)

    }

    @GrpcMethod('BonusService', 'UpdateReferralBonus')
    UpdateReferralBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.update(data,BONUS_TYPE_REFERRAL)

    }

    @GrpcMethod('BonusService', 'CreateShareBetBonus')
    CreateShareBetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.create(data,BONUS_TYPE_SHARE_BET)

    }

    @GrpcMethod('BonusService', 'UpdateShareBetBonus')
    UpdateShareBetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.update(data,BONUS_TYPE_SHARE_BET)

    }

    @GrpcMethod('BonusService', 'GetBonus')
    GetBonus(data: GetBonusRequest): Promise<GetBonusResponse> {

        return this.bonusService.all(data)

    }

    @GrpcMethod('BonusService', 'UpdateBonusStatus')
    UpdateBonusStatus(data: BonusStatusRequest): Promise<CreateBonusResponse> {

        return this.bonusService.status(data)

    }

    @GrpcMethod('BonusService', 'DeleteBonus')
    DeleteBonus(data: GetBonusRequest): Promise<DeleteBonusResponse> {

        return this.bonusService.delete(data)

    }

    @GrpcMethod('BonusService', 'GetUserBonus')
    GetUserBonus(data: GetUserBonusRequest): Promise<GetUserBonusResponse> {

        return this.bonusService.userBonus(data)

    }

    @GrpcMethod('BonusService', 'AwardBonus')
    AwardBonus(data: AwardBonusRequest): Promise<UserBonusResponse> {

        return this.bonusService.awardBonus(data)

    }

    @GrpcMethod('BonusService', 'PlaceBonusBet')
    PlaceBonusBet(data: UserBet): Promise<PlaceBetResponse> {

        return this.CreateBet(data)

    }

    @GrpcMethod('BonusService', 'CreateCampaignBonus')
    CreateCampaignBonus(data: CreateCampaignBonusDto): Promise<CreateBonusResponse> {

        return this.bonusService.createCampaignBonus(data)

    }

    @GrpcMethod('BonusService', 'UpdateCampaignBonus')
    UpdateCampaignBonus(data: UpdateCampaignBonusDto): Promise<CreateBonusResponse> {

        return this.bonusService.updateCampaignBonus(data)

    }

    @GrpcMethod('BonusService', 'DeleteCampaignBonus')
    DeleteCampaignBonus(data: DeleteCampaignBonusDto): Promise<CreateBonusResponse> {

        return this.bonusService.deleteCampaignBonus(data)

    }

    @GrpcMethod('BonusService', 'RedeemCampaignBonus')
    RedeemCampaignBonus(data: RedeemCampaignBonusDto): Promise<CreateBonusResponse> {

        return this.bonusService.redeemCampaignBonus(data)

    }

    @GrpcMethod('BonusService', 'GetCampaignBonus')
    GetCampaignBonus(data: GetBonusByClientID): Promise<AllCampaignBonus> {

        return this.bonusService.getCampaignBonus(data)

    }

    async CreateBet(data: UserBet): Promise<PlaceBetResponse> {

        // validations
        if (data.clientId == 0) {

            return {
                status: 401,
                statusDescription: "missing clientID",
                betId: 0
            }
        }

        if (data.bonusId == 0) {

            return {
                status: 401,
                statusDescription: "missing bonus ID",
                betId: 0
            }
        }

        if (data.userId == 0) {

            return {
                status: 401,
                statusDescription: "missing userID",
                betId: 0
            }
        }

        if (data.betslip.length == 0) {

            return {
                status: 401,
                statusDescription: "missing slips",
                betId: 0
            }
        }

        let existingUserBonus = new Userbonus()

        // check if this bonus exists
        let userBonus = await this.userBonusRepository.findOne({
            where: {
                id: data.bonusId,
                user_id: data.userId,
                status: 1
            }
        });

        if (userBonus === null || userBonus.id === null || userBonus.id === 0) {

            this.logger.error("userBonus type does not exist")

            return {
                status: 401,
                statusDescription: "bonus type does not exist or is expired",
                betId: 0
            }
        }

        // check if this bonus exists
        let existingBonus = await this.bonusRepository.findOne({
            where: {
                client_id: data.clientId,
                bonus_type: userBonus.bonus_type,
                status: 1
            }
        });

        if (existingBonus === null || existingBonus.id === null || existingBonus.id === 0) {

            this.logger.error("Bonus type does not exist")

            return {
                status: 401,
                statusDescription: "bonus type does not exist",
                betId: 0
            }

        }

        // check if bonus is expired
        if(userBonus.expiry_date_in_timestamp < this.bonusService.getTimestampInSeconds()) {

            return {
                status: 401,
                statusDescription: "bonus has expired",
                betId: 0
            }

        }


        // validate stake
        if(data.stake > userBonus.balance) {

            return {
                status: 401,
                statusDescription: "You have insufficient bonus balance to place a bet of "+data.stake+". Your bonus balance is "+userBonus.balance,
                betId: 0
            }

        }

        if(data.stake < existingBonus.minimum_betting_stake) {

            return {
                status: 401,
                statusDescription: "Your stake of "+data.stake+" is below the minimum betting stake for this bonus. Place a bet with a stake of at least "+existingBonus.minimum_betting_stake,
                betId: 0
            }
        }

        // check if user qualifies for bonus
        if(existingBonus.minimum_events < data.betslip.length) {

            this.logger.error("minimum_events rule violated")

            return {
                status: 401,
                statusDescription: "You need atleast "+existingBonus.minimum_events+" events to use this bonus",
                betId: 0
            }
        }

        // validate odds
        //2. odds validation
        let selections = [];
        let totalOdds = 1;
        let userSelection = data.betslip

        for (const selection of userSelection) {

            if (selection.eventName.length === 0 )
                return {status: 400, statusDescription: "missing event name in your selection ", betId: 0};

            if (selection.eventType.length === 0 )
                selection.eventType = "match";

            if (selection.eventId === 0 )
                return {status: 400, statusDescription: "missing event ID in your selection ", betId: 0};

            if (selection.producerId === 0 )
                return {status: 400, statusDescription: "missing producer id in your selection ", betId: 0};

            if (selection.marketId === 0 )
                return {status: 400, statusDescription: "missing market id in your selection ", betId: 0};

            if (selection.marketName.length === 0 )
                return {status: 400, statusDescription: "missing market name in your selection ", betId: 0};

            if (selection.outcomeName.length === 0 )
                return {status: 400, statusDescription: "missing outcome name in your selection ", betId: 0};

            if (selection.outcomeId.length === 0 )
                return {status: 400, statusDescription: "missing outcome id in your selection ", betId: 0};

            if (selection.specifier === undefined )
                return {status: 400, statusDescription: "missing specifier in your selection ", betId: 0};

            if (selection.odds === 0 )
                return {status: 400, statusDescription: "missing odds in your selection ", betId: 0};

            // get odds
            let odd = await this.getOdds(selection.producerId, selection.eventId, selection.marketId, selection.specifier, selection.outcomeId)

            if (odd === 0 ) { // || odd.active == 0 || odd.status !== 0 ) {

                this.logger.info("selection suspended " + JSON.stringify(selection))

                return {
                    statusDescription: "Your selection " + selection.eventName + " - " + selection.marketName + " is suspended",
                    status: 400,
                    betId: 0
                };

            }

            if(existingBonus.minimum_odds_per_event > 0 && existingBonus.minimum_odds_per_event < odd) {

                this.logger.error("minimum_odds_per_event rule violated")

                return {
                    status: 401,
                    statusDescription: "You need at least odds of "+existingBonus.minimum_odds_per_event+" for each event to use this bonus",
                    betId: 0
                }
            }

            selection.odds = odd

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

            totalOdds = totalOdds * odd
        }

        if (selections.length === 0)
            return {status: 400, statusDescription: "missing selections", betId: 0};

        if(existingBonus.minimum_total_odds > 0 && existingBonus.minimum_total_odds < totalOdds) {

            this.logger.error("minimum_total_odds rule violated")

            return {
                status: 401,
                statusDescription: "You need at least total odds of "+existingBonus.minimum_total_odds+" to use this bonus",
                betId: 0
            }
        }


        // user qualifies for bonus

        // create transaction
        let transaction =  new Transactions()
        transaction.client_id = data.clientId
        transaction.user_id = data.userId
        transaction.amount = data.stake
        transaction.bonus_id = userBonus.id
        transaction.transaction_type = TRANSACTION_TYPE_DEBIT
        transaction.reference_type = REFERENCE_TYPE_PLACEBET
        transaction.reference_id = data.bonusId
        transaction.description = "Customer placed a bet using "+existingBonus.name+" bonus"
        const transactionResult = await this.transactionsRepository.save(transaction)

        // place bet
        let betRequest = {} as PlaceBetRequest
        betRequest.betslip =  selections
        betRequest.userId = data.userId
        betRequest.stake = data.stake
        betRequest.source = data.source
        betRequest.clientId = data.clientId
        betRequest.ipAddress = data.ipAddress
        betRequest.bonusId = userBonus.id

        let betResponse =  await this.placeBet(betRequest).toPromise()

        if(betResponse.betId == 0 ) {

            // rollback transaction
            await this.transactionsRepository.delete({
                id: transactionResult.id,
            })

            return {
                betId: 0,
                status: betResponse.status,
                statusDescription: betResponse.statusDescription,
            }

        } else {

            let rollover_count = userBonus.completed_rollover_count + 1;
            let pending_amount = userBonus.pending_amount  - data.stake;
            let rolled_amount = userBonus.rolled_amount + data.stake;

            // deduct bonus
            await this.userBonusRepository.update(
                {
                    id: userBonus.id,
                },
                {
                    balance: userBonus.balance - data.stake,
                    completed_rollover_count: rollover_count,
                    rolled_amount: rolled_amount,
                    pending_amount: pending_amount,
                    used_amount: userBonus.used_amount + data.stake,
                });

            // create bet
            let bonusBet = new Bonusbet();
            bonusBet.bet_id = betResponse.betId
            bonusBet.user_id = data.userId
            bonusBet.client_id = data.clientId
            bonusBet.bonus_type = existingBonus.bonus_type
            bonusBet.stake = data.stake
            bonusBet.status = BET_PENDING
            bonusBet.user_bonus_id = userBonus.id
            bonusBet.rollover_count = rollover_count
            bonusBet.rolled_amount = rolled_amount
            bonusBet.pending_amount = pending_amount
            const bonusBetResult = await this.bonusBetRepository.save(bonusBet)
            return {
                betId: betResponse.betId,
                status: 200,
                statusDescription: "Bet placed successfully",
            }

        }

    }

    getProducerStatus(producerID: number): Observable<ProducerstatusreplyInterface> {

        return this.oddsService.GetProducerStatus({producer: producerID})
    }

    getOddsStatus(data: GetOddsRequest ): Observable<GetOddsReply>  {

        return this.oddsService.GetOdds(data)
    }

    placeBet(data: PlaceBetRequest ): Observable<PlaceBetResponse>  {

        return this.bettingService.placeBet(data)
    }

    async getOdds(producerId: number, eventId: number, marketId: number, specifier: string, outcomeId: string): Promise<number> {

        if(producerId !== 3 ) {

            // check producer id
            let producerStatus = await this.getProducerStatus(producerId).toPromise()

            if (producerStatus.status === 0) {

                this.logger.error("Producer " + producerId + " | status " + producerStatus.status)
                return 0;
            }

        }

        let odds  = {
            producerID:producerId,
            eventID:eventId,
            marketID:marketId,
            outcomeID:outcomeId,
            specifier:specifier,
        }

        let vm = this;

        let oddStatus =  await this.getOddsStatus(odds).toPromise()

        this.logger.info(oddStatus)

        return oddStatus.statusName == 'Active' && oddStatus.active == 1 ? oddStatus.odds  : 0

    }

}