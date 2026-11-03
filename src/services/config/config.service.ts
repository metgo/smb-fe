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
      'ENV_NAME',
      'API_PORT',
      'BASE_URL',
      'FE_BASE_URL',
      'TRAVEL_WEBSITE_URL',
      'MONGODB_URI',
      'JWT_TOKEN_EXPIRES',
      'ACCESS_TOKEN_EXPIRATION',
      'REFRESH_TOKEN_EXPIRATION',
      'OTP_EXPIRATION',
      'ACCESS_TOKEN',
      'REFRESH_TOKEN',
      'GCS_BUCKET',
      'MEDIA_STORAGE_FOLDER',
      'GCS_PROJECT_ID',
      'GCS_FILE_PATH',
      'GOOGLE_SHEET_CONTACT_US',
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
      'CARDCOM_URL',
      'CARDCOM_TERMINAL_NUMBER',
      'CARDCOM_API_NAME',
      'MOCK_CARDCOM_PAYMENT',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILURE',
      'PAYMENT_INDICATOR',
      'CARDCOM_INVOICE_URL',
      'CARDCOM_INVOICE_API_PWD',
      'IDENTIFIER_ID',
      'MAILCHIMP_MARKETING_API_KEY',
      'MAILCHIMP_TRANSACTIONAL_API_KEY',
      'MAILCHIMP_AUDIENCE',
      'MAILCHIMP_SERVER_PREFIX',
      'MAILCHIMP_FROM_EMAIL',
      'MAILCHIMP_TAV8_SUPPORT_EMAIL',
      'GA_BALA_PROPERTY_ID',
      'GA_TAV8_PROPERTY_ID',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI',
      'SMS_CONFIRM_PURCHASE_TOKEN',
      'WALLET_ISSUER_ID',
      'GOOGLE_WALLET_PATH',
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
      ENV_NAME: Joi.string().required(),
      API_PORT: Joi.number().port().default(3000),
      BASE_URL: Joi.string().required(),
      FE_BASE_URL: Joi.string().required(),
      TRAVEL_WEBSITE_URL: Joi.string().optional(),
      MONGODB_URI: Joi.string().required(),
      JWT_TOKEN_EXPIRES: Joi.number().required(),
      ACCESS_TOKEN_EXPIRATION: Joi.number().required(),
      REFRESH_TOKEN_EXPIRATION: Joi.number().required(),
      OTP_EXPIRATION: Joi.number().required(),
      ACCESS_TOKEN: Joi.string().required(),
      REFRESH_TOKEN: Joi.string().required(),
      GCS_BUCKET: Joi.string().required(),
      MEDIA_STORAGE_FOLDER: Joi.string().required(),
      GCS_PROJECT_ID: Joi.string().required(),
      GCS_FILE_PATH: Joi.string().required(),
      GOOGLE_SHEET_CONTACT_US: Joi.string().required(),
      SUPER_ADMIN_EMAIL: Joi.string().required(),
      SUPER_ADMIN_PASSWORD: Joi.string().required(),
      DATABASE_ENCRYPTION_KEY: Joi.string().required(),
      FROM_EMAIL: Joi.string().required(),
      SERVICE_CLIENT: Joi.string().required(),
      PRIVATE_KEY: Joi.string().required(),
      ACCESS_URL: Joi.string().required(),
      FROM_NAME: Joi.string().required(),
      EMAIL_HOST: Joi.string().required(),
      USER: Joi.string().required(),
      PASSWORD: Joi.string().required(),

      CARDCOM_URL: Joi.string().required(),
      CARDCOM_TERMINAL_NUMBER: Joi.number().required(),
      CARDCOM_API_NAME: Joi.string().required(),
      MOCK_CARDCOM_PAYMENT: Joi.string().optional(),
      PAYMENT_SUCCESS: Joi.string().required(),
      PAYMENT_FAILURE: Joi.string().required(),
      PAYMENT_INDICATOR: Joi.string().required(),
      CARDCOM_INVOICE_URL: Joi.string().optional(),
      CARDCOM_INVOICE_API_PWD: Joi.string().optional(),
      IDENTIFIER_ID: Joi.string().required(),
      MAILCHIMP_MARKETING_API_KEY: Joi.string().required(),
      MAILCHIMP_TRANSACTIONAL_API_KEY: Joi.string().required(),
      MAILCHIMP_AUDIENCE: Joi.string().required(),
      MAILCHIMP_SERVER_PREFIX: Joi.string().required(),
      MAILCHIMP_FROM_EMAIL: Joi.string().required(),
      MAILCHIMP_TAV8_SUPPORT_EMAIL: Joi.string().required(),
      GA_BALA_PROPERTY_ID: Joi.string().required(),
      GA_TAV8_PROPERTY_ID: Joi.string().required(),
      GOOGLE_CLIENT_ID: Joi.string().required(),
      GOOGLE_CLIENT_SECRET: Joi.string().required(),
      GOOGLE_REDIRECT_URI: Joi.string().required(),
      SMS_CONFIRM_PURCHASE_TOKEN: Joi.string().required(),
      WALLET_ISSUER_ID: Joi.string().optional(),
      GOOGLE_WALLET_PATH: Joi.string().optional(),
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

  get baseUrl() {
    return {
      BE: this.get('BASE_URL'),
      FE: this.get('FE_BASE_URL'),
      TRAVEL: this.get('TRAVEL_WEBSITE_URL'),
    };
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

  get cardCom() {
    return {
      URL: this.get('CARDCOM_URL'),
      TERMINAL_NUMBER: this.get('CARDCOM_TERMINAL_NUMBER'),
      API_NAME: this.get('CARDCOM_API_NAME'),
      SUCCESS: this.get('PAYMENT_SUCCESS'),
      FAILURE: this.get('PAYMENT_FAILURE'),
      INDICATOR: this.get('PAYMENT_INDICATOR'),
      INVOICE_URL: this.get('CARDCOM_INVOICE_URL'),
      API_PASSWORD: this.get('CARDCOM_INVOICE_API_PWD'),
    };
  }

  get externalApiIdentifier() {
    return {
      IDENTIFIER_ID: this.get('IDENTIFIER_ID'),
    };
  }

  get mailchimp() {
    return {
      MARKETING_API_KEY: this.get('MAILCHIMP_MARKETING_API_KEY'),
      TRANSACTIONAL_API_KEY: this.get('MAILCHIMP_TRANSACTIONAL_API_KEY'),
      AUDIENCE: this.get('MAILCHIMP_AUDIENCE'),
      SERVER_PREFIX: this.get('MAILCHIMP_SERVER_PREFIX'),
      FROM_EMAIL: this.get('MAILCHIMP_FROM_EMAIL'),
      TAV8_SUPPORT_EMAIL: this.get('MAILCHIMP_TAV8_SUPPORT_EMAIL'),
    };
  }

  get JWT() {
    return {
      TOKEN_EXPIRES: this.get('JWT_TOKEN_EXPIRES'),
      ACCESS_TOKEN_EXPIRATION: this.get('ACCESS_TOKEN_EXPIRATION'),
      REFRESH_TOKEN_EXPIRATION: this.get('REFRESH_TOKEN_EXPIRATION'),
      OTP_EXPIRATION: this.get('OTP_EXPIRATION'),
      ACCESS_TOKEN: this.get('ACCESS_TOKEN'),
      REFRESH_TOKEN: this.get('REFRESH_TOKEN'),
    };
  }

  get googleAnalytics() {
    return {
      BALA_PROPERTY_ID: this.get('GA_BALA_PROPERTY_ID'),
      TAV8_PROPERTY_ID: this.get('GA_TAV8_PROPERTY_ID'),
    };
  }

  get googleOAuth() {
    return {
      CLIENT_ID: this.get('GOOGLE_CLIENT_ID'),
      CLIENT_SECRET: this.get('GOOGLE_CLIENT_SECRET'),
      REDIRECT_URI: this.get('GOOGLE_REDIRECT_URI'),
    };
  }

  // Wallet issuance is skipped when ISSUER_ID is not set. The key file
  // falls back to the GCS service account - that account must be added
  // as a user in the Google Pay & Wallet Console for the issuer.
  get googleWallet() {
    return {
      ISSUER_ID: this.get('WALLET_ISSUER_ID'),
      KEY_FILE: this.get('GOOGLE_WALLET_PATH') || this.get('GCS_FILE_PATH'),
    };
  }
}
