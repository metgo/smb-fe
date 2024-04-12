import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { SettingsServices } from 'src/modules/settings/settings.services';
import { SettingsDTO } from 'src/modules/settings/dto/settings.dto';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class SettingsController {
  constructor(private settingsService: SettingsServices) {}

  @ApiEndpoint({
    tags: ['Admin', 'Settings'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.SETTINGS.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create new page',
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('admin/settings')
  async createSettings(
    @Req() req,
    @Res() response: Response,
    @Body() body: SettingsDTO,
  ) {
    const settings = await this.settingsService.create(req.user.id, body);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.SETTINGS.CREATED,
      settings,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Settings'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SETTINGS.LISTED,
    },
    params: [{ name: 'slug', type: 'string', required: true }],
    operation: 'View Page By Slug',
  })
  @HttpCode(HttpStatus.OK)
  @Get('settings/:slug')
  async getTermsAndCondition(
    @Res() response: Response,
    @Param('slug') slug: string,
  ) {
    const settings = await this.settingsService.findBySlug(slug);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SETTINGS.LISTED,
      settings,
      null,
      null,
    );
  }
}
