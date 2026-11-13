import * as winston from 'winston';
import { LoggingWinston as GCloudLoggingWinston } from '@google-cloud/logging-winston';
import { WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '../config/config.service';

const configService = new ConfigService();
const ENV_NAME = configService.get('ENV_NAME');
const IS_LOCAL_RUN = process.env.DEV_CONFIG === 'local';

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
  defaultMeta: {
    service: 'marketplace-travel-backend',
  },
  format: winston.format.combine(
    filterRouterExplorer(),
    winston.format.timestamp(),
    winston.format.json(), // Log in JSON format for structured logging
  ),
  transports: [
    ...(ENV_NAME !== 'local'
      ? [
        new GCloudLoggingWinston({
          prefix: `METGO-${ENV_NAME}`,
          projectId: 'metgo-staging-server',
          keyFilename: configService.get('GCS_FILE_PATH'),
        }),
      ]
      : []),
    // Running from local.env (DEV_CONFIG=local) with ENV_NAME=dev would
    // otherwise send every log to Cloud Logging only, leaving the terminal
    // silent - also print to the console whenever we're running locally.
    ...(ENV_NAME === 'local' || IS_LOCAL_RUN
      ? [new winston.transports.Console()]
      : []),
  ],
} as WinstonModuleOptions;
