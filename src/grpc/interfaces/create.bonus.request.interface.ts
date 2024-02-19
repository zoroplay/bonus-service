export interface CreateBonusRequest {
    id: number;
    clientId: number;
    bonusType: string;
    product: string;
    // minimumStake: number;
    duration: number;
    maxAmount: number;
    minimumOddsPerEvent: number;
    minimumTotalOdds: number;
    applicableBetType: string;
    maximumWinning: number;
    minimumLostGames: number;
    minimumSelection: number;
    resetIntervalType: string;
    minimumEntryAmount: number;
    bonusAmount: number;
    // bonusAmountMultiplier: number;
    rolloverCount: number;
    name: string;
    creditType: string;
}