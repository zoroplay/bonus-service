import { UserBonus } from '../interfaces/get.user.bonus.response.interface';

export interface FetchReportRequest {
  bonusType: string;
  from: string;
  to: string;
}

export interface FetchReportResponse {
  message: string;
  status: boolean;
  data: UserBonus[];
}
