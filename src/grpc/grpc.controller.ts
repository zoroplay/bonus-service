import {Controller} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {GetUserBonusRequest} from "./interfaces/get.user.bonus.request.interface";
import {CreateBonusRequest} from "./interfaces/create.bonus.request.interface";
import {CreateBonusResponse} from "./interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "./interfaces/get.bonus.request.interface";
import {GetBonusResponse} from "./interfaces/get.bonus.response.interface";
import {DeleteBonusResponse} from "./interfaces/delete.bonus.response.interface";
import {GetUserBonusResponse} from "./interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "./interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "./interfaces/user.bonus.response.interface";
import {UserBonus} from "./interfaces/user.bonus.interface";
import {BonusService} from "./services/bonus.service";
import {UserBet} from "./interfaces/user.bet.interface";
import {HasBonusResponse} from "./interfaces/has.bonus.response.interface";
import {BonusStatusRequest} from "./interfaces/bonus.status.request.interface";
import {
    BONUS_TYPE_CASHBACK,
    BONUS_TYPE_FIRST_DEPOSIT,
    BONUS_TYPE_FREEBET,
    BONUS_TYPE_REFERRAL,
    BONUS_TYPE_SHARE_BET
} from "../constants";

@Controller()
export class GrpcController {

    constructor(
        private readonly bonusService: BonusService,
    ) {
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

    @GrpcMethod('BonusService', 'HasBonusBet')
    HasBonusBet(data: UserBet): Promise<HasBonusResponse> {

        return this.bonusService.hasBonusBet(data)

    }

    @GrpcMethod('BonusService', 'DebitBonusBet')
    DebitBonusBet(data: UserBet): Promise<HasBonusResponse> {

        return this.bonusService.debitBonusBet(data)

    }

}