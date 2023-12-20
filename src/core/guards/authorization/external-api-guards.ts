import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';
import { ConfigService } from 'src/services/config/config.service';

@Injectable()
export class ExternalApiGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { identifierId } = request.query;

    if (identifierId !== this.configService.externalApiIdentifier.IDENTIFIER_ID) {
      throw new UnauthorizedException(ServerErrors.FORBIDDEN);
    }

    return true;
  }
}
