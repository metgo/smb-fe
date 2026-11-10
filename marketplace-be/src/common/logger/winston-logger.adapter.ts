import { Inject, Injectable, Provider } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as LoggerProvider } from 'winston';

import { Logger } from 'src/common/logger/logger';

@Injectable()
export class WinstonLoggerAdapter implements Logger {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: LoggerProvider,
  ) {}

  alert(message: string, context?: any) {
    this.logger.alert(message, context);
  }

  critical(message: string, context?: any) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, context);
  }

  emergency(message: string, context?: any) {
    this.logger.emerg(message, context);
  }

  error(message: string, context?: any) {
    this.logger.error(message, context);
  }

  info(message: string, context?: any) {
    this.logger.info(message, context);
  }

  notice(message: string, context?: any) {
    this.logger.notice(message, context);
  }

  warning(message: string, context?: any) {
    this.logger.warning(message, context);
  }
}

export const WinstonLoggerProvider = {
  provide: 'Logger',
  useClass: WinstonLoggerAdapter,
} as Provider;
