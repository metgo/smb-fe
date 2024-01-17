import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { UserType } from '../users/users.type';
import { Roles } from 'src/core/guards/authorization/roles';
import { AccessibilityService } from './accessibility.service';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { createAccessibilityDto, updateAccessibilityDto } from './dto';
import { responseHelper } from 'src/core/helper/response.helper';

@Controller()
export class AccessibilityController {
  constructor(
        private readonly accessibilityService: AccessibilityService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: 201,
      description: ServerSuccess.ACCESSIBILITY.CREATED,
    },
    noAuthToken: true,
  })
  @Post('admin/accessibility')
  async create(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createAccessibilityDto,
  ) {
    await this.accessibilityService.findByFieldName('name', dto.name);
    const groupType = await this.accessibilityService.create(dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.ACCESSIBILITY.CREATED,
      groupType,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: 200,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility')
  async getAll(@Res() response: Response, @Query() query: LocaleFilterQuery) {
    const groupType = await this.accessibilityService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      groupType,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: 200,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('locale') locale: Locale,
  ) {
    const groupType = await this.accessibilityService.getOne(id, locale);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      groupType,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: 200,
      description: ServerSuccess.ACCESSIBILITY.UPDATED,
    },
    noAuthToken: true,
  })
  @Put('admin/accessibility/:id')
  async update(
      @Req() req,
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: updateAccessibilityDto,
  ) {
    await this.accessibilityService.findByFieldNameExcludeId('name', dto.name, id);
    const groupType = await this.accessibilityService.update(id, dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.UPDATED,
      groupType,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: 200,
      description: ServerSuccess.ACCESSIBILITY.DELETED,
    },
    noAuthToken: true,
  })
  @Delete('admin/accessibility/:id')
  async delete(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const groupType = await this.accessibilityService.softDelete(id, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.DELETED,
      groupType,
      null,
      null,
    );
  }
}
