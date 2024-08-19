import {Controller} from "@nestjs/common";
import { GrpcMethod} from "@nestjs/microservices";
import {CheckDepositBonusRequest, GetUserBonusRequest} from "./interfaces/get.user.bonus.request.interface";
import {CreateBonusResponse} from "./interfaces/create.bonus.response.interface";
import {GetBonusRequest} from "./interfaces/get.bonus.request.interface";
import {GetBonusResponse} from "./interfaces/get.bonus.response.interface";
import {DeleteBonusResponse} from "./interfaces/delete.bonus.response.interface";
import {CheckDepositBonusResponse, GetUserBonusResponse} from "./interfaces/get.user.bonus.response.interface";
import {AwardBonusRequest} from "./interfaces/award.bonus.request.interface";
import {UserBonusResponse} from "./interfaces/user.bonus.response.interface";
import {BonusService} from "./services/bonus.service";
import {SettleBet, UserBet} from "./interfaces/user.bet.interface";
import {BonusStatusRequest} from "./interfaces/bonus.status.request.interface";

import {
  AllCampaignBonus,
  CreateCampaignBonusDto,
  DeleteCampaignBonusDto,
  GetCampaignDTO,
  RedeemCampaignBonusDto,
  UpdateCampaignBonusDto,
} from './interfaces/campaign.bonus.interface';
import { BonusBetService } from './services/bonus.bet.service';
import { PlaceBetResponse } from './interfaces/betting.service.interface';
import { FetchReportRequest } from './dto/bonus.dto';
import { ReportsService } from './services/reports.service';
import { CommonResponseObj, CreateBonusRequest, GetBonusByClientID } from "src/proto/bonus.pb";

@Controller()
export class GrpcController {
  constructor(
    private readonly bonusService: BonusService,
    private readonly reportsService: ReportsService,

    private readonly bonusBetService: BonusBetService,
  ) {}

  @GrpcMethod('BonusService', 'fetchBonusReport')
  fetchBonusReport(payload: FetchReportRequest) {
    console.log('FetchBonusReport');
    return this.reportsService.fetchBonus(payload);
  }

  @GrpcMethod('BonusService', 'SearchBonus')
  SearchBonus(payload: GetBonusByClientID) {
    console.log('Search bonus');
    return this.bonusService.searchBonus(payload);
  }

  @GrpcMethod('BonusService', 'CreateBonus')
  CreateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    return this.bonusService.create(data);
  }

  @GrpcMethod('BonusService', 'UpdateBonus')
  UpdateCashbackBonus(data: CreateBonusRequest): Promise<CreateBonusResponse> {
    return this.bonusService.update(data);
  }

    @GrpcMethod('BonusService', 'GetBonus')
    GetBonus(data: GetBonusRequest): Promise<GetBonusResponse> {
        return this.bonusService.all(data)
    }

  @GrpcMethod('BonusService', 'UpdateBonusStatus')
  UpdateBonusStatus(data: BonusStatusRequest): Promise<CreateBonusResponse> {
    return this.bonusService.status(data);
  }

  @GrpcMethod('BonusService', 'DeleteBonus')
  DeleteBonus(data: GetBonusRequest): Promise<DeleteBonusResponse> {
    return this.bonusService.delete(data);
  }

  @GrpcMethod('BonusService', 'GetUserBonus')
  GetUserBonus(data: GetUserBonusRequest): Promise<GetUserBonusResponse> {
    return this.bonusService.userBonus(data);
  }

    @GrpcMethod('BonusService', 'CheckDepositBonus')
    CheckFirstDeposit(data: CheckDepositBonusRequest): Promise<CheckDepositBonusResponse> {
        return this.bonusService.checkDepositBonus(data)
    }

  @GrpcMethod('BonusService', 'AwardBonus')
  AwardBonus(data: AwardBonusRequest): Promise<UserBonusResponse> {
    return this.bonusService.awardBonus(data);
  }

  @GrpcMethod('BonusService', 'PlaceBonusBet')
  PlaceBonusBet(data: UserBet): Promise<PlaceBetResponse> {
    return this.bonusBetService.placeBet(data);
  }

  @GrpcMethod('BonusService', 'CreateCampaignBonus')
  CreateCampaignBonus(
    data: CreateCampaignBonusDto,
  ): Promise<CreateBonusResponse> {
    return this.bonusService.createCampaignBonus(data);
  }

  @GrpcMethod('BonusService', 'UpdateCampaignBonus')
  UpdateCampaignBonus(
    data: UpdateCampaignBonusDto,
  ): Promise<CreateBonusResponse> {
    return this.bonusService.updateCampaignBonus(data);
  }

  @GrpcMethod('BonusService', 'DeleteCampaignBonus')
  DeleteCampaignBonus(
    data: DeleteCampaignBonusDto,
  ): Promise<CreateBonusResponse> {
    return this.bonusService.deleteCampaignBonus(data);
  }

  @GrpcMethod('BonusService', 'RedeemCampaignBonus')
  RedeemCampaignBonus(
    data: RedeemCampaignBonusDto,
  ): Promise<CreateBonusResponse> {
    return this.bonusService.redeemCampaignBonus(data);
  }

  @GrpcMethod('BonusService', 'GetCampaignBonus')
  GetCampaignBonus(data: GetBonusByClientID): Promise<AllCampaignBonus> {
    return this.bonusService.getCampaignBonus(data);
  }

  @GrpcMethod('BonusService', 'GetCampaign')
  GetCampaign(data: GetCampaignDTO): Promise<any> {
    return this.bonusService.getCampaign(data);
  }

  @GrpcMethod('BonusService', 'ValidateBetSelections')
  ValidateBetSelections(data: UserBet): Promise<any> {
    return this.bonusBetService.validateBet(data);
  }

  @GrpcMethod('BonusService', 'SettleBet')
  SettleBet(data: SettleBet): Promise<CommonResponseObj> {
    console.log('Settle bet');
    return this.bonusBetService.settleBet(data);
  }

  @GrpcMethod('BonusService', 'DeletePlayerData')
  deletePlayerData(data: GetBonusRequest): Promise<any> {
    console.log('delete player data');
    return this.bonusService.deletePlayerData(data.clientId);
  }
}
