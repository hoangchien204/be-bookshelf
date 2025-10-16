// src/test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('test')
export class TestController {
  @Get()
  hello() {
    return { message: 'Throttler global áp dụng ở đây' };
  }

  @SkipThrottle() // route này không bị giới hạn
  @Get('open')
  open() {
    return { message: 'Route này bỏ qua throttler' };
  }
}
