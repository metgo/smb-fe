import {
  Controller, Get, HttpCode, HttpStatus, Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { GetSiteInfoQuery } from '../queries/get-site-info.query';
import { GetPromotionalItemsQuery } from '../queries/get-promotional-items.query';
import { GetPromotionalItemsRequest } from '../request/get-promotional-items.request';

@Controller('external-api')
export class ExternalApiController {
  constructor(
    private readonly externalApiService: ExternalApiServices,
    private readonly queryBus: QueryBus,
  ) {}

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
    return await this.queryBus.execute(new GetSiteInfoQuery(identifierId));
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
  @Get('promotional-items/:identifierId')
  async getPromotionalItems(@Param('identifierId') identifierId: string, @Query() query: GetPromotionalItemsRequest) {
    return await this.queryBus.execute(new GetPromotionalItemsQuery(identifierId, query));
  }
}
