import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { GoogleSheetsModule } from 'src/services/google-sheets/google-sheets.module';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [ConfigModule, GoogleSheetsModule],
  controllers: [ContactUsController],
})
export class ContactUsModule {}
