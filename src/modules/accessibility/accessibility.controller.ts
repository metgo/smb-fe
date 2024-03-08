import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { UserType } from '../users/users.type';
import { AccessibilityService } from './accessibility.service';
import { createAccessibilityDto, updateAccessibilityDto } from './dto';
import { LocaleQuery } from './dto/locale-query.dto';

@Controller()
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.CREATED,
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
    const accessibility = await this.accessibilityService.create(
      dto,
      req.user.id,
    );
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.ACCESSIBILITY.CREATED,
      accessibility,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility')
  async getAll(@Res() response: Response, @Query() query: LocaleFilterQuery) {
    const accessibility = await this.accessibilityService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      accessibility,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.LISTED,
    },
  })
  @Get('admin/accessibility/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query() query: LocaleQuery,
  ) {
    const accessibility = await this.accessibilityService.getOne(id, query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.LISTED,
      accessibility,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
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
    await this.accessibilityService.findByFieldNameExcludeId(
      'name',
      dto.name,
      id,
    );
    const accessibility = await this.accessibilityService.update(
      id,
      dto,
      req.user.id,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ACCESSIBILITY.UPDATED,
      accessibility,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Accessibility'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ACCESSIBILITY.DELETED,
    },
    noAuthToken: true,
  })
  @Delete('admin/accessibility/:id')
  async delete(@Req() req, @Res() response: Response, @Param('id') id: string) {
    const groupType = await this.accessibilityService.softDelete(
      id,
      req.user.id,
    );
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
