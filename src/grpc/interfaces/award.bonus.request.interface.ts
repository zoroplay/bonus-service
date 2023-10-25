export interface AwardBonusRequest {
    clientId: number;
    bonusType: string;
    userId: number;
    amount: number;
}