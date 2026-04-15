import { Module } from '@nestjs/common';
import { GAController } from 'src/services/google-analytics/ga.controller';
import { ConfigModule } from 'src/services/config/config.module';
import { GoogleAnalyticsService } from 'src/services/google-analytics/ga.services';

@Module({
  imports: [ConfigModule],
  providers: [GoogleAnalyticsService],
  controllers: [GAController],
  exports: [GoogleAnalyticsService],
})
export class GAModule {}
