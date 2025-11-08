import { Module } from '@nestjs/common';
import { AdvancedController } from './advanced.controller';
import { AdvancedService } from './advanced.service';

@Module({
  controllers: [AdvancedController],
  providers: [AdvancedService],
  exports: [AdvancedService]
})
export class AdvancedModule {}
