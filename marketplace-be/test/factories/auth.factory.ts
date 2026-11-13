import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/schema/users.schema';
import { ConfigService } from 'src/services/config/config.service';

export const authToken = (user: User): string => {
  const configService = new ConfigService();
  const auth = new JwtService({ secret: configService.JWT.ACCESS_TOKEN }).sign({
    id: user._id,
    email: user.email,
    role: user.role,
    hasBusiness: user.hasBusiness,
  });
  return auth;
};
