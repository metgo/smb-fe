/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  Controller, Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { FilterQuery } from 'src/modules/icons/dto';
import { IconsService } from 'src/modules/icons/icons.service';

@Controller('admin/icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_LISTED,
    },
  })
  @Get('')
  async getIcons(@Res() response: Response, @Query() query: FilterQuery) {
    const icon = await this.iconsService.getIcons(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_LISTED,
      icon,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_LISTED,
    },
  })
  @Get('/:id')
  async getIcon(@Res() response: Response, @Param('id') id: string) {
    const icon = await this.iconsService.getIcon(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_LISTED,
      icon,
      null,
      null,
    );
  }
}
