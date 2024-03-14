
export interface BetSlipSelection {
    eventName: string;
    eventType: string;
    eventId: number;
    producerId: number;
    marketId: number;
    marketName: string;
    specifier: string;
    outcomeId: string;
    outcomeName: string;
    odds: number;
    sportId: number;
}

export interface UserBet {
    selections: BetSlipSelection[];
    clientId: number;
    userId: number;
    stake: number;
    bonusId: number;
    totalOdds: number;
    source: string;
    ipAddress: string
    betId?: number;
}

export interface ValidateBetResponse{
    success: boolean;
    id: number;
    message: string;
}

export interface SettleBet {
    clientId: number;
    betId: number;
    status: number;
    amount?: number;
}