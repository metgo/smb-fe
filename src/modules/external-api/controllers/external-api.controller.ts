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
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateExternalApiDTO } from 'src/modules/external-api/dto/create-external-api.dto';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { UserType } from 'src/modules/users/users.type';

@Controller('external-api')
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiServices) {}

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.EXTERNAL_API.CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Post('')
  async create(
    @Body() body: CreateExternalApiDTO,
    @Req() req,
    @Res() response: Response,
  ) {
    const externalApi = await this.externalApiService.create(req.user.id, body);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.EXTERNAL_API.CREATED,
      externalApi,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Get('')
  async getAll(@Res() response: Response, @Query() query: CommonFilterQuery) {
    const externalApis = await this.externalApiService.getAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EXTERNAL_API.LISTED,
      externalApis,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Get(':id')
  async get(@Param('id') id: string, @Res() response: Response) {
    const externalApis = await this.externalApiService.getById(id);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EXTERNAL_API.LISTED,
      externalApis,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.UPDATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Put(':externalApiId')
  async update(
    @Body() body: CreateExternalApiDTO,
    @Param('externalApiId') externalApiId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const externalApi = await this.externalApiService.update(
      req.user.id,
      externalApiId,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EXTERNAL_API.UPDATED,
      externalApi,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: `**Company** ${ServerSuccess.EXTERNAL_API.DELETED}`,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Delete(':externalApiId')
  async softDelete(
    @Param('externalApiId') externalApiId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const externalApi = await this.externalApiService.softDelete(
      req.user.id,
      externalApiId,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      `${externalApi.companyDetails.name} ${ServerSuccess.EXTERNAL_API.DELETED}`,
      externalApi,
      null,
      null,
    );
  }
}
