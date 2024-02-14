export interface AwardBonusRequest {
    clientId: number;
    username?: string;
    bonusId: number;
    userId: string;
    amount?: number;
    baseValue?: number
    promoCode?: string;
    status?: number;
}