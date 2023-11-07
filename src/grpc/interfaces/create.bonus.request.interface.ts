export interface CreateBonusRequest {
    id: number;
    clientId: number;
    bonusType: string;
    minimumStake: number;
    expiryInHours: number;
    minimumEvents: number;
    minimumOddsPerEvent: number;
    minimumTotalOdds: number;
    applicableBetType: string;
    maximumWinning: number;

    minimumLostGames: number;
    minimumSelection: number;
    resetIntervalType: string;
    minimumEntryAmount: number;
    bonusAmount: number;
    bonusAmountMultiplier: number;
    rolloverCount: number;
    name: string;
    minimumBettingStake: number;
}