import {
  Controller, Get, HttpCode, HttpStatus, Param,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@Controller('external-api')
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiServices) {}

  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':identifierId')
  async get(@Param('identifierId') identifierId: string) {
    const externalApis
      = await this.externalApiService.findByIdentifierIdAndPopulateTheme(
        identifierId,
      );

    return externalApis;
  }

  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-info/:identifierId')
  async getSiteInfo(@Param('identifierId') identifierId: string) {
    const externalApis
      = await this.externalApiService.getSiteInfoByIdentifierId(identifierId);

    return externalApis;
  }
}
