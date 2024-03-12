export interface GetUserBonusRequest {
    clientId: number;
    userId: number;
    // bonusType: string;
    id?: number;
    status?: number;
}

export interface CheckDepositBonusRequest {
    clientId: number;
    userId: number;
}