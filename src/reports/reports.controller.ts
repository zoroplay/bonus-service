import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReportsService } from './reports.service';
import { FetchReportRequest } from 'src/grpc/dto/bonus.dto';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @GrpcMethod('BonusService', 'fetchBonusReport')
  fetchBonusReport(payload: FetchReportRequest) {
    console.log('FetchBonusReport', 12356, payload);
    return this.reportsService.fetchBonus(payload);
  }
}
