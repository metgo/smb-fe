/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import {
  Controller, Get, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetAllEventsQuery } from '../events/queries/get-all-events.query';
import { GetAllTripsQuery } from '../trips/queries/get-all-trips.query';
import { GetAllEventsRequest } from '../events/requests/get-all-events.request';
import { GetAllTripsRequest } from '../trips/request/get-all-trips.request';
import { GetAllApprovedBusinessesRequest } from '../business/tourism/request/get-all-approved-businesses.request';
import { GetAllApprovedBusinessesQuery } from '../business/tourism/queries/get-all-approved-businesses.query';

@Controller()
export class CampaignController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.CAMPAIGN_LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('amenities-info/:campCode')
  async getSiteInfo(@Param('campCode') campCode: string) {
    const requestEvent = new GetAllEventsRequest();
    requestEvent.campCode = campCode;

    const requestTrip = new GetAllTripsRequest();
    requestTrip.campCode = campCode;
    requestTrip.isTrip = true;

    const requestFunday = new GetAllTripsRequest();
    requestFunday.campCode = campCode;
    requestFunday.isTrip = false;

    const requestBusiness = new GetAllApprovedBusinessesRequest();
    requestBusiness.campCode = campCode;

    const [eventResult, tripResult, businessResult, fundayResult]
      = await Promise.all([
        this.queryBus.execute(new GetAllEventsQuery(requestEvent)),
        this.queryBus.execute(new GetAllTripsQuery(requestTrip)),
        this.queryBus.execute(
          new GetAllApprovedBusinessesQuery(requestBusiness),
        ),
        this.queryBus.execute(new GetAllTripsQuery(requestFunday)),
      ]);

    return {
      event: (eventResult.totalData ?? 0) > 0,
      trip: (tripResult.totalData ?? 0) > 0,
      business: (businessResult.totalData ?? 0) > 0,
      funday: (fundayResult.totalData ?? 0) > 0,
    };
  }

  // @UseGuards(JwtExternalApiAuthGuard)
  // @UseGuards(ExternalApiGuard)
  // @ApiEndpoint({
  //   tags: ['Campaign'],
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.CAMPAIGN_CREATED,
  //   },
  //   noAuthToken: true,
  //   softBlockExtraDtoFields: true,
  // })
  // @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  // @Post('admin/campaigns')
  // async create(
  //   @Body() dto: CreateCampaignDto,
  //   @Query() query: ExternalApiPostQuery,
  //   @Req() request,
  //   @Res() response: Response,
  //   @UploadedFiles() image: Array<Express.Multer.File>,
  // ) {
  //   const campaign = await this.campaignService.createCampaigns(
  //     dto,
  //     image,
  //     request.user.id,
  //     query.identifierId,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     ServerSuccess.CAMPAIGN_CREATED,
  //     campaign,
  //     null,
  //     null,
  //   );
  // }
}
