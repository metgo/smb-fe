import * as dotenv from 'dotenv';
import * as Joi from '@hapi/joi';
import * as fs from 'fs';

interface IEnvConfig {
  [key: string]: string | undefined;
}

export class ConfigService {
  private readonly envConfig: IEnvConfig;

  constructor() {
    const { DEV_CONFIG } = process.env;

    const config
      = DEV_CONFIG && fs.existsSync(`${DEV_CONFIG}.env`)
        ? dotenv.parse(fs.readFileSync(`${DEV_CONFIG}.env`))
        : this.parseEnv();

    this.envConfig = this.validateInput(config);
  }

  // eslint-disable-next-line class-methods-use-this
  private parseEnv(): IEnvConfig {
    const ENV_VARIABLES = [
      'NODE_ENV',
      'HOST',
      'API_PORT',
      'ENV_NAME',
      'AUTH_JWT_SECRET',
      'RESET_PASSWORD_TOKEN_EXPIRATION_IN_SECONDS',
      'JWT_TOKEN_EXPIRES',
      'ADMIN_JWT_TOKEN_EXPIRES',
      'REFRESH_TOKEN_TOKEN_EXPIRATION_IN_SECONDS',
      'MONGODB_URI',
    ];

    return ENV_VARIABLES.reduce((obj: any, variable) => {
      if (process.env[variable]) {
        // eslint-disable-next-line no-param-reassign
        obj[variable] = process.env[variable];
      }

      return obj;
    }, {});
  }

  // eslint-disable-next-line class-methods-use-this
  private validateInput(envConfig: IEnvConfig): IEnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'testing')
        .default('development'),
      HOST: Joi.string().default('localhost'),
      PORT: Joi.number().port().default(3000),
      API_PORT: Joi.number().port().default(3000),
      DATABASE_HOST: Joi.string().default('localhost'),
      DATABASE_PORT: Joi.number().port().default(5432),
      DATABASE_NAME: Joi.string().required(),
      DATABASE_USERNAME: Joi.string().required(),
      DATABASE_PASSWORD: Joi.string().required(),
      DATABASE_ENCRYPTION_KEY: Joi.string().required(),
      ENV_NAME: Joi.string().required(),
      AUTH_JWT_SECRET: Joi.string().required(),
      JWT_TOKEN_EXPIRES: Joi.string().required(),
      MONGODB_URI: Joi.string().required(),
    }).unknown(true);
    const { error, value: validatedEnvConfig }
      = envVarsSchema.validate(envConfig);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }

  /* eslint-disable no-dupe-class-members */
  get(key: string, defaultValue: string): string;
  get(key: string, defaultValue: number): string | number;
  get(key: string): string;
  get(key: string, defaultValue: string | number = '') {
    return this.envConfig[key] || defaultValue;
  }

  get nodeEnvironment() {
    return this.get('NODE_ENV');
  }

  /**
   * Whether this backend is deployed and running in the cloud
   */

  /**
   * Whether the database is deployed in the cloud and has an associated
   * backend deployed and running in the cloud.
   */
}
