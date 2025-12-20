import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('loaderio-1df09878e1a995ff79543da970fe2b67') 
  verifyLoaderIO() {
    return 'loaderio-1df09878e1a995ff79543da970fe2b67'; 
  }
}
