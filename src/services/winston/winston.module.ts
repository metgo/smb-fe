import { Module } from '@nestjs/common';
import { WinstonLoggerProvider } from 'src/common/logger/winston-logger.adapter';

@Module({
  providers: [WinstonLoggerProvider],
  exports: [WinstonLoggerProvider],
})
export class WinstonLoggerModule {}
