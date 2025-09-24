import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats/avg-delivery-time')
  getAvgDeliveryTime() {
    return this.service.getAverageDeliveryTime();
  }

  @Get('stats/delivery-time-analysis')
  getDeliveryTimeAnalysis() {
    return this.service.getDeliveryTimeAnalysis();
  }
}
