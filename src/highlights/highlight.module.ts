import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Highlight } from '../entitis/highlights.entity';
import { HighlightService } from './highlight.service';
import { HighlightController } from './highlight.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Highlight])],
  providers: [HighlightService],
  controllers: [HighlightController],
  exports: [HighlightService],
})
export class HighlightModule {}
