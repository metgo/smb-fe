import { Module } from '@nestjs/common';

import { GaMeasurementService } from './ga-measurement.service';

@Module({
  providers: [GaMeasurementService],
  exports: [GaMeasurementService],
})
export class GaMeasurementModule {}
