import {Controller} from "@nestjs/common";
import { GrpcMethod} from "@nestjs/microservices";
import {CheckFirstDepositRequest, GetUserBonusRequest} from "./interfaces/get.user.bonus.request.interface";
import {CreateBonusRequest} from "./interfaces/create.bonus.request.interface";
import {CreateBonusResponse} from "./interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "./interfaces/get.bonus.request.interface";
import {GetBonusResponse} from "./interfaces/get.bonus.response.interface";
import {DeleteBonusResponse} from "./interfaces/delete.bonus.response.interface";
import {CheckFirstDepositResponse, GetUserBonusResponse} from "./interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "./interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "./interfaces/user.bonus.response.interface";
import {BonusService} from "./services/bonus.service";
import {UserBet} from "./interfaces/user.bet.interface";
import {BonusStatusRequest} from "./interfaces/bonus.status.request.interface";

import {
    AllCampaignBonus,
    CreateCampaignBonusDto,
    DeleteCampaignBonusDto, GetBonusByClientID,
    GetCampaignDTO,
    RedeemCampaignBonusDto,
    UpdateCampaignBonusDto
} from "./interfaces/campaign.bonus.interface";
import { BonusBetService } from "./services/bonus.bet.service";
import { PlaceBetResponse } from "./interfaces/betting.service.interface";

@Controller()
export class GrpcController  {

    constructor(
        private readonly bonusService: BonusService,

        private readonly bonusBetService: BonusBetService,
    ) {
    }

    @GrpcMethod('BonusService', 'CreateBonus')
    CreateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
        return this.bonusService.create(data)
    }

    @GrpcMethod('BonusService', 'UpdateBonus')
    UpdateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
        return this.bonusService.update(data)
    }

    // @GrpcMethod('BonusService', 'CreateFirstDepositBonus')
    // CreateFirstDepositBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.create(data, BONUS_TYPE_FIRST_DEPOSIT)
    // }

    // @GrpcMethod('BonusService', 'UpdateFirstDepositBonus')
    // UpdateFirstDepositBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.update(data, BONUS_TYPE_FIRST_DEPOSIT)
    // }

    // @GrpcMethod('BonusService', 'CreateFreebetBonus')
    // CreateFreebetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.create(data, BONUS_TYPE_FREEBET)
    // }

    // @GrpcMethod('BonusService', 'UpdateFreebetBonus')
    // UpdateFreebetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {

    //     return this.bonusService.update(data, BONUS_TYPE_FREEBET)

    // }

    // @GrpcMethod('BonusService', 'CreateReferralBonus')
    // CreateReferralBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.create(data, BONUS_TYPE_REFERRAL)
    // }

    // @GrpcMethod('BonusService', 'UpdateReferralBonus')
    // UpdateReferralBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.update(data, BONUS_TYPE_REFERRAL)
    // }

    // @GrpcMethod('BonusService', 'CreateShareBetBonus')
    // CreateShareBetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.create(data, BONUS_TYPE_SHARE_BET)
    // }

    // @GrpcMethod('BonusService', 'UpdateShareBetBonus')
    // UpdateShareBetBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    //     return this.bonusService.update(data, BONUS_TYPE_SHARE_BET)
    // }

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

    @GrpcMethod('BonusService', 'CheckFirstDeposit')
    CheckFirstDeposit(data: CheckFirstDepositRequest): Promise<CheckFirstDepositResponse> {
        return this.bonusService.checkFirstDepositBonus(data)
    }

    @GrpcMethod('BonusService', 'AwardBonus')
    AwardBonus(data: AwardBonusRequest): Promise<UserBonusResponse> {
        return this.bonusService.awardBonus(data)
    }

    @GrpcMethod('BonusService', 'PlaceBonusBet')
    PlaceBonusBet(data: UserBet): Promise<PlaceBetResponse> {
        return this.bonusBetService.placeBet(data)
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

    @GrpcMethod('BonusService', 'GetCampaign')
    GetCampaign(data: GetCampaignDTO): Promise<any> {
        return this.bonusService.getCampaign(data)
    }

    @GrpcMethod('BonusService', 'ValidateBetSelections')
    ValidateBetSelections(data: UserBet): Promise<any> {
        return this.bonusBetService.validateBet(data)
    }
}