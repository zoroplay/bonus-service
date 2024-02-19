export interface GetUserBonusRequest {
    clientId: number;
    userId: number;
    // bonusType: string;
    id?: number;
    status?: number;
}

export interface CheckFirstDepositRequest {
    clientId: number;
    userId: number;
}