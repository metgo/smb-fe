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
      'FROM_NAME',
      'FROM_EMAIL',
      'SERVICE_CLIENT',
      'PRIVATE_KEY',
      'ACCESS_URL',
      'EMAIL_HOST',
      'USER',
      'PASSWORD',
      'PAYMENT_URL',
      'PAYMENT_API',
      'PAYMENT_SECRET',
      'PAYMENT_PAGE_UUID',
      'PAYMNET_SUCCESS',
      'PAYMENT_FAILURE',
      'URL',
      'IDENTIFIER_ID',
      'MAILCHIMP_API_KEY',
      'MAILCHIMP_AUDIENCE',
      'MAILCHIMP_SERVER_PREFIX',
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
      FROM_EMAIL: Joi.string().required(),
      SERVICE_CLIENT: Joi.string().required(),
      PRIVATE_KEY: Joi.string().required(),
      ACCESS_URL: Joi.string().required(),
      FROM_NAME: Joi.string().required(),
      EMAIL_HOST: Joi.string().required(),
      USER: Joi.string().required(),
      PASSWORD: Joi.string().required(),
      PAYMENT_URL: Joi.string().required(),
      PAYMENT_API: Joi.string().required(),
      PAYMENT_SECRET: Joi.string().required(),
      PAYMENT_PAGE_UUID: Joi.string().required(),
      PAYMNET_SUCCESS: Joi.string().required(),
      PAYMENT_FAILURE: Joi.string().required(),
      URL: Joi.string().required(),
      IDENTIFIER_ID: Joi.string().required(),
      MAILCHIMP_API_KEY: Joi.string().required(),
      MAILCHIMP_AUDIENCE: Joi.string().required(),
      MAILCHIMP_SERVER_PREFIX: Joi.string().required(),

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

  get emailDetails() {
    return {
      FROM_NAME: this.get('FROM_NAME'),
      FROM_EMAIL: this.get('FROM_EMAIL'),
      SERVICE_CLIENT: this.get('SERVICE_CLIENT'),
      PRIVATE_KEY: this.get('PRIVATE_KEY'),
      ACCESS_URL: this.get('ACCESS_URL'),
      EMAIL_HOST: this.get('EMAIL_HOST'),
      USER: this.get('USER'),
      PASSWORD: this.get('PASSWORD'),
    };
  }

  get paymentDetails() {
    return {
      URL: this.get('PAYMENT_URL'),
      API: this.get('PAYMENT_API'),
      SECRET: this.get('PAYMENT_SECRET'),
      PAGE_UUID: this.get('PAYMENT_PAGE_UUID'),
      SUCCESS: this.get('PAYMNET_SUCCESS'),
      FAILURE: this.get('PAYMENT_FAILURE'),
      SERVER_URL: this.get('URL'),
    };
  }

  get externalApiIdentifier() {
    return {
      IDENTIFIER_ID: this.get('IDENTIFIER_ID'),
    };
  }

  get email() {
    return {
      MAILCHIMP_API_KEY: this.get('MAILCHIMP_API_KEY'),
      MAILCHIMP_AUDIENCE: this.get('MAILCHIMP_AUDIENCE'),
      MAILCHIMP_SERVER_PREFIX: this.get('MAILCHIMP_SERVER_PREFIX'),
    };
  }
}
