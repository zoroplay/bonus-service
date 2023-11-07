export interface AwardBonusRequest {
    clientId: number;
    bonusType: string;
    bonusId: number;
    userId: string;
    amount: number;
    baseValue: number
}