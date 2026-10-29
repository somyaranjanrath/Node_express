import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getDashboard(): string {
    return this.appService.getDashboardHtml();
  }

  @Get('api/all-data')
  async getAllData() {
    return await this.appService.getAllData();
  }
}
