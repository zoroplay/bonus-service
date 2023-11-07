import {Observable} from "rxjs";

export interface PlaceBetRequest {
    betslip: BetSlip[];
    clientId: number;
    userId: number;
    stake: number;
    source: string;
    ipAddress: string;
    bonusId: number;
}

export interface BetSlip {
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

export interface PlaceBetResponse {
    betId: number;
    status: number;
    statusDescription: string;
}


interface BettingService {

    placeBet(request: PlaceBetRequest): Observable<PlaceBetResponse>;
}

export default BettingService;
