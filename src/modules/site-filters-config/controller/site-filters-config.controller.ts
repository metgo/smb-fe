import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetSiteFiltersConfigByIdentifierIdQuery } from '../queries/get-site-filters-config-by-identifierId.query';
import { GetSiteFiltersConfigByIdentifierIdRequest } from '../requests/get-site-filters-config-by-identifierId.request';
import { GetProductsByTopicQuery } from '../queries/get-products-by-topic.query';
import { GetProductsByTopicRequest } from '../requests/get-products-by-topic.request';
import { GetProductsGroupedByTopicQuery } from '../queries/get-products-grouped-by-topic.query';
import { GetProductsGroupedByTopicRequest } from '../requests/get-products-grouped-by-topic.request';

@Controller('')
export class SiteSettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Site Configs'],
    response: {
      status: HttpStatus.OK,
      description: `Site Filters Config ${ServerSuccess.LISTED}`,
    },
    softBlockExtraDtoFields: true,
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-filter-config/:identifierId')
  async getSiteSettingsByIdentifierId(
    @Param('identifierId') identifierId: string,
    @Query() query: GetSiteFiltersConfigByIdentifierIdRequest,
  ) {
    const siteSetting = await this.queryBus.execute(
      new GetSiteFiltersConfigByIdentifierIdQuery(identifierId, query),
    );

    return siteSetting;
  }

  @ApiEndpoint({
    tags: ['Site Configs'],
    response: {
      status: HttpStatus.OK,
      description: `Topic Products ${ServerSuccess.LISTED}`,
    },
    softBlockExtraDtoFields: true,
    params: [{ name: 'externalApiId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-filter-config/topic-products/:externalApiId')
  async getProductsByTopic(
    @Param('externalApiId') externalApiId: string,
    @Query() query: GetProductsByTopicRequest,
  ) {
    console.log('Received request for products by topic with query:', query);
    console.log('Received request for products by topic with externalApiId:', externalApiId);
    return this.queryBus.execute(
      new GetProductsByTopicQuery(externalApiId, query),
    );
  }

  @ApiEndpoint({
    tags: ['Site Configs'],
    response: {
      status: HttpStatus.OK,
      description: `Products grouped by topic ${ServerSuccess.LISTED}`,
    },
    softBlockExtraDtoFields: true,
    params: [{ name: 'externalApiId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-filter-config/products-grouped-by-topic/:externalApiId')
  async getProductsGroupedByTopic(
    @Param('externalApiId') externalApiId: string,
    @Query() query: GetProductsGroupedByTopicRequest,
  ) {
    return this.queryBus.execute(
      new GetProductsGroupedByTopicQuery(externalApiId, query),
    );
  }
}
