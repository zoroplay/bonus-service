import {Observable} from "rxjs";

export interface ProducerstatusrequestInterface {
    producer: number;
}

export interface GetOddsReply {
    odds: number;
    status: number;
    statusName: string;
    active: number;
}

export interface GetOddsRequest {
    producerID: number;
    eventID: number;
    marketID: number;
    specifier: string;
    outcomeID: string;
}

export interface ProducerstatusreplyInterface {
    status: number;
}

interface Odds {
    GetOdds(data: GetOddsRequest): Observable<GetOddsReply>;
    GetProducerStatus(data: ProducerstatusrequestInterface): Observable<ProducerstatusreplyInterface>;
}

export default Odds;
