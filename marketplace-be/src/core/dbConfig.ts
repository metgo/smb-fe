import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

export default {
  uri: configService.get('MONGODB_URI'),
};
