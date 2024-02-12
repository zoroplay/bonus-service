import {CreateBonusRequest} from "./create.bonus.request.interface";

export interface CreateCampaignBonusDto {
    clientId: number;
    name: string;
    bonusCode: string;
    bonusId: number;
    startDate: string;
    endDate: string;
    affiliateIds?: string;
    trackierCampaignId?: string
}

export interface UpdateCampaignBonusDto {
    id: number;
    clientId: number;
    name: string;
    bonusCode: string;
    bonusId: number;
    startDate: string;
    endDate: string;
}

export interface RedeemCampaignBonusDto {
    clientId: number;
    bonusCode: string;
    userId: number;
}

export interface DeleteCampaignBonusDto {
    clientId: number;
    id: number;
}

export interface GetCampaignDTO {
    clientId: number;
    promoCode: string;
}

export interface CampaignBonusData {
    id: number;
    clientId: number;
    name: string;
    bonusCode: string;
    bonus: CreateBonusRequest;
    startDate: string;
    endDate: string;
}

export interface AllCampaignBonus {
    bonus: CampaignBonusData[];
}

export interface GetBonusByClientID {
    clientId: number;
}