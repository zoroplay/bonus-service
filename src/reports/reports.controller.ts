import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReportsService } from './reports.service';
import { FetchReportRequest, WALLET_SERVICE_NAME } from 'src/wallet/wallet.pb';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @GrpcMethod(WALLET_SERVICE_NAME, 'fetchBonusReport')
  fetchBonusReport(payload: FetchReportRequest) {
    return this.reportsService.fetchBonus(payload);
  }
}
