/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import {
  Controller, Get, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { CampaignService } from './campaign.service';
import { GetAllEventsQuery } from '../events/queries/get-all-events.query';
import { GetAllTripsQuery } from '../trips/queries/get-all-trips.query';
import { GetAllEventsRequest } from '../events/requests/get-all-events.request';
import { GetAllTripsRequest } from '../trips/request/get-all-trips.request';
import { GetAllApprovedBusinessesRequest } from '../business/tourism/request/get-all-approved-businesses.request';
import { GetAllApprovedBusinessesQuery } from '../business/tourism/queries/get-all-approved-businesses.query';
import { GetAllPOIsRequest } from '../point-of-interests/request/get-all-pois.request';
import { GetAllPOIsQuery } from '../point-of-interests/queries/get-all-pois.query';

@Controller()
export class CampaignController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly campaignService: CampaignService,
    private readonly externalApiServices: ExternalApiServices,
  ) {}

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
  // OLD implementation (pre associatedWebsiteIds migration) — business/POI were
  // resolved straight from campCode, same as events/trips still are below.
  // Note: the old code also had a bug — the POI existence check was dispatched
  // through GetAllApprovedBusinessesQuery instead of GetAllPOIsQuery, so it was
  // silently re-running the business query instead of checking POIs.
  //
  // async getSiteInfo(@Param('campCode') campCode: string) {
  //   const requestEvent = new GetAllEventsRequest();
  //   requestEvent.campCode = campCode;
  //
  //   const requestTrip = new GetAllTripsRequest();
  //   requestTrip.campCode = campCode;
  //   requestTrip.isTrip = true;
  //
  //   const requestFunday = new GetAllTripsRequest();
  //   requestFunday.campCode = campCode;
  //   requestFunday.isTrip = false;
  //
  //   const requestBusiness = new GetAllApprovedBusinessesRequest();
  //   requestBusiness.campCode = campCode;
  //
  //   const requestPOI = new GetAllPOIsRequest();
  //   requestPOI.campCode = campCode;
  //
  //   const [businessResult, poiResult, eventResult, tripResult, fundayResult]
  //     = await Promise.all([
  //       this.queryBus.execute(
  //         new GetAllApprovedBusinessesQuery(requestBusiness),
  //       ),
  //       this.queryBus.execute(new GetAllApprovedBusinessesQuery(requestPOI)),
  //       this.queryBus.execute(new GetAllEventsQuery(requestEvent)),
  //       this.queryBus.execute(new GetAllTripsQuery(requestTrip)),
  //       this.queryBus.execute(new GetAllTripsQuery(requestFunday)),
  //     ]);
  //
  //   return {
  //     business: (businessResult.totalData ?? 0) > 0,
  //     poi: (poiResult.totalData ?? 0) > 0,
  //     event: (eventResult.totalData ?? 0) > 0,
  //     trip: (tripResult.totalData ?? 0) > 0,
  //     funday: (fundayResult.totalData ?? 0) > 0,
  //   };
  // }
  async getSiteInfo(@Param('campCode') campCode: string) {
    const requestEvent = new GetAllEventsRequest();
    requestEvent.campCode = campCode;

    const requestTrip = new GetAllTripsRequest();
    requestTrip.campCode = campCode;
    requestTrip.isTrip = true;

    const requestFunday = new GetAllTripsRequest();
    requestFunday.campCode = campCode;
    requestFunday.isTrip = false;

    // Business/POI are now scoped by ExternalApi.associatedWebsiteIds rather than
    // campCode, so resolve the site whose primaryCampIds includes this campaign.
    const campaign = await this.campaignService.findCampaignAndReturn(
      'code',
      campCode,
    );
    const externalApi = await this.externalApiServices.findByPrimaryCampId(
      campaign._id.toString(),
    );

    const businessPoiPromise = externalApi?.identifierId
      ? (() => {
        const requestBusiness = new GetAllApprovedBusinessesRequest();
        requestBusiness.identifierId = externalApi.identifierId;

        const requestPOI = new GetAllPOIsRequest();
        requestPOI.identifierId = externalApi.identifierId;

        return Promise.all([
          this.queryBus.execute(
            new GetAllApprovedBusinessesQuery(requestBusiness),
          ),
          this.queryBus.execute(new GetAllPOIsQuery(requestPOI)),
        ]);
      })()
      : Promise.resolve([{ totalData: 0 }, { totalData: 0 }]);

    const [
      [businessResult, poiResult],
      eventResult,
      tripResult,
      fundayResult,
    ] = await Promise.all([
      businessPoiPromise,
      this.queryBus.execute(new GetAllEventsQuery(requestEvent)),
      this.queryBus.execute(new GetAllTripsQuery(requestTrip)),
      this.queryBus.execute(new GetAllTripsQuery(requestFunday)),
    ]);

    return {
      business: (businessResult.totalData ?? 0) > 0,
      poi: (poiResult.totalData ?? 0) > 0,
      event: (eventResult.totalData ?? 0) > 0,
      trip: (tripResult.totalData ?? 0) > 0,
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
