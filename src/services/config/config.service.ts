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

    const config = DEV_CONFIG && fs.existsSync(`${DEV_CONFIG}.env`)
      ? dotenv.parse(fs.readFileSync(`${DEV_CONFIG}.env`))
      : this.parseEnv();

    this.envConfig = this.validateInput(config);
  }

  // eslint-disable-next-line class-methods-use-this
  private parseEnv(): IEnvConfig {
    const ENV_VARIABLES = [
      'NODE_ENV',
      'HOST',
      'ENV_NAME',
      'API_PORT',
      'MONGODB_URI',
      'JWT_TOKEN_EXPIRES',
      'ADMIN_JWT_TOKEN_EXPIRES',
      'REFRESH_TOKEN_EXPIRATION_IN_SECONDS',
      'RESET_PASSWORD_TOKEN_EXPIRATION_IN_SECONDS',
      'ACCESS_TOKEN',
      'REFRESH_TOKEN',
      'GCS_BUCKET',
      'MEDIA_STORAGE_FOLDER',
      'GCS_PROJECT_ID',
      'GCS_FILE_PATH',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_PASSWORD',
      'DATABASE_ENCRYPTION_KEY',
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
      ENV_NAME: Joi.string().required(),
      API_PORT: Joi.number().port().default(3000),
      PORT: Joi.number().port().default(3000),
      DATABASE_ENCRYPTION_KEY: Joi.string().required(),
      MONGODB_URI: Joi.string().required(),
      JWT_TOKEN_EXPIRES: Joi.number().required(),
      ACCESS_TOKEN: Joi.string().required(),
      REFRESH_TOKEN: Joi.string().required(),
      GCS_BUCKET: Joi.string().required(),
      MEDIA_STORAGE_FOLDER: Joi.string().required(),
      GCS_PROJECT_ID: Joi.string().required(),
      GCS_FILE_PATH: Joi.string().required(),
      SUPER_ADMIN_EMAIL: Joi.string().required(),
      SUPER_ADMIN_PASSWORD: Joi.string().required(),
    }).unknown(true);

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);

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

  get superAdminEmail() {
    return this.get('SUPER_ADMIN_EMAIL');
  }

  get superAdminPassword() {
    return this.get('SUPER_ADMIN_PASSWORD');
  }

  get dataBaseEncriptionKey() {
    return this.get('DATABASE_ENCRYPTION_KEY');
  }
}
