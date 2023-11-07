export interface UserBetDTO {
    betId : number;
    stake : number;
    rolloverCount : number;
    status : number;
    rolledAmount : number;
    pendingAmount : number;
    created : string;
}

export interface UserBonus {
    bonusType : string;
    amount : number;
    expiryDateInTimestamp : number;
    created : string;
    name : string;
    rolledAmount : number;
    pendingAmount : number;
    totalRolloverCount : number;
    completedRolloverCount : number;
    bets: UserBetDTO[]
}

export interface GetUserBonusResponse {
    bonus: UserBonus[];
}