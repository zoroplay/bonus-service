export interface CreateBonusRequest {
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
}