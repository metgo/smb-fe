import {
  Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { AuthorityDTO } from 'src/modules/authority/dto/authority.dto';
import { AuthorityService } from 'src/modules/authority/authority.service';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class AuthorityController {
  constructor(
    private readonly authorityService: AuthorityService,
  ) {}

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Authority'],
    noAuthToken: true,
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.AUTHORITY.CREATED,
    },
  })
  @Post('admin/authorities')
  async create(
    @Body() dto: AuthorityDTO,
    @Req() req,
    @Res() response: Response,
  ) {
    const authority = await this.authorityService.create(dto, req.user.id);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.AUTHORITY.CREATED,
      authority,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Authority'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.AUTHORITY.LISTED,
    },
  })
  @Get('authorities/:authorityId')
  async getAuthority(
    @Param('authorityId') authorityId: string,
    @Res() response: Response,
  ) {
    const authority = await this.authorityService.getOne(authorityId);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.AUTHORITY.LISTED,
      authority,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Authority'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.AUTHORITY.LISTED,
    },
  })
  @Get('authorities')
  async getAllAuthority(
    @Query() query: CommonFilterQuery,
    @Res() response: Response,
  ) {
    const authorities = await this.authorityService.getAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.AUTHORITY.LISTED,
      authorities,
      null,
      null,
    );
  }
}
