import * as winston from 'winston';
import { LoggingWinston as GCloudLoggingWinston } from '@google-cloud/logging-winston';
import { WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '../config/config.service';

const configService = new ConfigService();
const ENV_NAME = configService.get('ENV_NAME');

const filterRouterExplorer = winston.format(info => {
  if (
    info.context === 'RouterExplorer'
    || info.context === 'RoutesResolver'
    || info.context === 'InstanceLoader'
    || info.message === 'Starting Nest application...'
    || info.message === 'Nest application successfully started'
  ) {
    return false;
  }
  return info;
});

export default {
  level: 'info',
  exitOnError: false,
  format: winston.format.combine(filterRouterExplorer(), winston.format.json()),
  transports:
    ENV_NAME !== 'local'
      ? new GCloudLoggingWinston({
        prefix: `METGO-${ENV_NAME}`,
        projectId: 'metgo-staging-server',
        keyFilename: configService.get('GCS_FILE_PATH'),
      })
      : new winston.transports.Console(),
} as WinstonModuleOptions;
