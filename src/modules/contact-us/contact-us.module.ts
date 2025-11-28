import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { GoogleSheetsModule } from 'src/services/google-sheets/google-sheets.module';
import { ConfigModule } from 'src/services/config/config.module';
import { CqrsModule } from '@nestjs/cqrs';
import { SendInquiryFundayHandler } from './commands/handler/send-inquiry-funday.handler';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    GoogleSheetsModule,
    MailChimpModule,
    ExternalApiModule,
  ],
  controllers: [ContactUsController],
  providers: [SendInquiryFundayHandler],
})
export class ContactUsModule {}
