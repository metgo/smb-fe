import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { SettingsServices } from 'src/modules/settings/settings.services';
import { SettingsDTO } from 'src/modules/settings/dto/settings.dto';
import { UpdateSettingsDto } from 'src/modules/settings/dto/update-settings.dto';
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
    operation: 'Get all settings page',
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('admin/settings')
  async getAllSettings(
    @Res() response: Response,
    @Query() query: CommonFilterQuery,
  ) {
    const settings = await this.settingsService.findAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SETTINGS.LISTED,
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

  @ApiEndpoint({
    tags: ['Settings', 'Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SETTINGS.UPDATED,
    },
    params: [{ name: 'id', type: 'string', required: true }],
    operation: 'Update Settings Details By Id',
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('admin/settings/:id')
  async updateById(
    @Body() body: UpdateSettingsDto,
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const settings = await this.settingsService.updateById(
      req.user.id,
      id,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SETTINGS.UPDATED,
      settings,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Settings', 'Admin'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SETTINGS.DELETED,
    },
    params: [{ name: 'id', type: 'string', required: true }],
    operation: 'Delete Settings Details By Id',
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('admin/settings/:id')
  async deleteById(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const deletedSettings = await this.settingsService.softDeleteById(
      req.user.id,
      id,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.SETTINGS.DELETED,
      deletedSettings,
      null,
      null,
    );
  }
}
