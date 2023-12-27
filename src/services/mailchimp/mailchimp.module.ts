import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/services/config/config.module';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';

@Module({
  imports: [ConfigModule],
  providers: [MailChimpService],
  exports: [MailChimpService],
})
export class MailChimpModule {}
