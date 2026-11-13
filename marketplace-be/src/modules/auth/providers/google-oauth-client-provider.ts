import { google } from 'googleapis';
import { Provider } from '@nestjs/common';

import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

export const GoogleOauthClientProvider = {
  provide: 'AuthClient',
  useFactory: async () => new google.auth.OAuth2(
    configService.googleOAuth.CLIENT_ID,
    configService.googleOAuth.CLIENT_SECRET,
    configService.googleOAuth.REDIRECT_URI,
  ),
} as Provider;
