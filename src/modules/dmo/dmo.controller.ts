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
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { DMOService } from 'src/modules/dmo//dmo.service';
import { CreateDMODto, UpdateDMODto, FilterQuery } from 'src/modules/dmo/dto';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class DMOController {
  constructor(private readonly dmoServices: DMOService) {}

  @ApiEndpoint({
    tags: ['Admin', 'DMO'],
    response: {
      status: 201,
      description: ServerSuccess.DMO_CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Roles(UserType.TRAVELLER, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('admin/dmo')
  async createDMO(@Res() response: Response, @Body() dto: CreateDMODto) {
    const newDMO = await this.dmoServices.createDMO(dto);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.DMO_CREATED,
      newDMO,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'DMO'],
    response: {
      status: 200,
      description: ServerSuccess.DMO_LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @Get('admin/dmo')
  async getAllDMO(@Res() response: Response, @Query() query: FilterQuery) {
    const dmo = await this.dmoServices.getAllDMO(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_LISTED,
      dmo,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'DMO'],
    response: {
      status: 200,
      description: ServerSuccess.DMO_UPDTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Roles(UserType.TRAVELLER, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Put('admin/dmo/:id')
  async updateMPSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: UpdateDMODto,
  ) {
    const dmo = await this.dmoServices.updateDMO(id, dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_UPDTED,
      dmo,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'DMO'],
    response: {
      status: 200,
      description: ServerSuccess.DMO_UPDTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Roles(UserType.TRAVELLER, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Delete('admin/dmo/:id')
  async deleteMPSubCategoriesItems(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const dmo = await this.dmoServices.softDeleteDMO(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_UPDTED,
      dmo,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'DMOId'],
    response: {
      status: 200,
      description: ServerSuccess.DMO_LISTED,
    },
  })
  @Post('admin/dmo-by-id')
  async getAllDMOById(@Res() response: Response, @Req() request) {
    const dmo = await this.dmoServices.getAllDMOById(request.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.DMO_LISTED,
      dmo,
      null,
      null,
    );
  }
}
