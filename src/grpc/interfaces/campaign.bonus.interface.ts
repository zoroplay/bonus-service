import {CreateBonusRequest} from "./create.bonus.request.interface";

export interface CreateCampaignBonusDto {
    clientId: number;
    name: string;
    bonusCode: string;
    bonusId: number;
    expiryDate: string;
}

export interface UpdateCampaignBonusDto {
    id: number;
    clientId: number;
    name: string;
    bonusCode: string;
    bonusId: number;
    expiryDate: string;
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

export interface CampaignBonusData {
    id: number;
    clientId: number;
    name: string;
    bonusCode: string;
    bonus: CreateBonusRequest;
    expiryDate: string;
}

export interface AllCampaignBonus {
    bonus: CampaignBonusData[];
}

export interface GetBonusByClientID {
    clientId: number;
}