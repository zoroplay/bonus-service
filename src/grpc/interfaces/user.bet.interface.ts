
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
    betslip: BetSlipSelection[];
    clientId: number;
    userId: number;
    stake: number;
    bonusId: number;
    totalOdds: number;
    source: string;
    ipAddress: string
}