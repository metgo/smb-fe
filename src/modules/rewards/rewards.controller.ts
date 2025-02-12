import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { UpdateRewardDto } from 'src/modules/rewards/dto/update-reward.dto';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardsService) {}

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMO,
    UserType.DMOADMIN,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Campaign'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.REWARD.UPDATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
    params: [{ name: 'rewardId', type: 'string', required: true }],
  })
  @Patch('admin/rewards/:rewardId')
  async create(
    @Body() dto: UpdateRewardDto,
    @Param('rewardId') rewardId: string,
    @Req() request,
    @Res() response: Response,
  ) {
    const reward = await this.rewardService.update(rewardId, dto, request.user);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.REWARD.UPDATED,
      reward,
      null,
      null,
    );
  }
}
