import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return this.appService.getHealth();
  }

  @Get('health/readiness')
  readiness() {
    return this.appService.getReadiness();
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  metrics() {
    return this.appService.getMetrics();
  }

  @Get('docs/openapi.json')
  openApiJson() {
    return this.appService.getOpenApiDocument();
  }
}
