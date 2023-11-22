import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { BussCategoriesService } from './buss-categories.service';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { createBussCategoryDto } from './dto/createBussCategoryDto';
import { ServerSuccess } from 'src/common/constant';
import { responseHelper } from 'src/core/helper/response.helper';
import { Response } from 'express';
import { updateBusinessDto } from '../business/dto';
import { FilterQuery } from './dto/query.dto';
import { Roles } from 'src/core/guards/authorization/roles';
import { UserType } from '../users/users.type';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';

@Controller()
export class BussCategoriesController {
  constructor(
        private readonly bussCategoryService: BussCategoriesService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Bussiness Categories'],
    response: {
      status: 201,
      description: ServerSuccess.BUSS_CATEGORY.CREATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Post('admin/buss-category')
  async create(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createBussCategoryDto,
  ) {
    await this.bussCategoryService.findByFieldName('name', dto.name);

    const newBussCategory = await this.bussCategoryService.create(dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.BUSS_CATEGORY.CREATED,
      newBussCategory,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Bussiness Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Get('admin/buss-category')
  async getAll(
    @Res() response: Response,
    @Query() query: FilterQuery,
  ) {
    const allBussCategoires = await this.bussCategoryService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.LISTED,
      allBussCategoires,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Bussiness Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Get('admin/buss-category/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const bussCategory = await this.bussCategoryService.getOne(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.LISTED,
      bussCategory,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Bussiness Categories'],
    response: {
      status: 201,
      description: ServerSuccess.BUSS_CATEGORY.UPDATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Put('admin/buss-category/:id')
  async update(
    @Req() req,
    @Res() response: Response,
    @Body() dto: updateBusinessDto,
    @Param('id') id: string,
  ) {
    await this.bussCategoryService.findByFieldNameExcludeId('name', dto.name, id);

    const updateBussCategory = await this.bussCategoryService.update(dto, id, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.UPDATED,
      updateBussCategory,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Bussiness Categories'],
    response: {
      status: 200,
      description: ServerSuccess.BUSS_CATEGORY.DELETED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Delete('admin/buss-category/:id')
  async softDelete(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const deleteBussCategory = await this.bussCategoryService.softDelete(id, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_CATEGORY.DELETED,
      deleteBussCategory,
      null,
      null,
    );
  }
}
