import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('loaderio-4fd1e984df10342b99fff567eef5aa05') 
  verifyLoaderIO() {
    return 'loaderio-4fd1e984df10342b99fff567eef5aa05'; 
  }
}
