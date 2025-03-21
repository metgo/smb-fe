import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/services/config/config.module';
import { SmsService } from 'src/services/sms/sms.service';

@Module({
  imports: [ConfigModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
