import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/services/config/config.module';
import { SmsService } from 'src/services/sms/sms.service';
import { SmsController } from 'src/services/sms/sms.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
