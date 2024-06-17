import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@Injectable()
export class ExternalApiGuard implements CanActivate {
  constructor(private readonly externalAPIService: ExternalApiServices) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { identifierId } = request.query;

    const externalApiExists = await this.externalAPIService.findByFieldName(
      'identifierId',
      identifierId,
    );

    if (!externalApiExists) {
      throw new UnauthorizedException(ServerErrors.FORBIDDEN);
    }

    return true;
  }
}
