import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsProvider } from './provider/google-sheets.provider';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [GoogleSheetsService, GoogleSheetsProvider],
  exports: [GoogleSheetsService],
})
export class GoogleSheetsModule {}
