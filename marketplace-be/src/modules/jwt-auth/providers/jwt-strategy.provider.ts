import { Provider } from '@nestjs/common';
import { JwtAuthStrategy } from 'src/modules/jwt-auth/jwt-auth.strategy';

export const JwtStrategyProvider = {
  provide: 'JwtStrategy',
  useClass: JwtAuthStrategy,
} as Provider;
