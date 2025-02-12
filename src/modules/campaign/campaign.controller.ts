/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import { Controller } from '@nestjs/common';

import { CampaignService } from 'src/modules/campaign/campaign.service';

@Controller()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

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
