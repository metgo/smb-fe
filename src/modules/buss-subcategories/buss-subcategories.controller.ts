import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { FilterQuery, createBussSubCategoryDto, updateBussSubCategoryDto } from './dto';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { UserType } from '../users/users.type';

@Controller()
export class BussSubCategoriesController {
  constructor(
        private readonly bussSubCategoriesService: BussSubCategoriesService,
  ) {}

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Business Sub Categories'],
    response: { status: 200, description: ServerSuccess.BUSS_SUB_CATEGORY.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Post('admin/buss-sub-category')
  async create(
      @Req() req,
      @Res() response: Response,
      @Body() dto: createBussSubCategoryDto,
  ) {
    await this.bussSubCategoriesService.findByFieldName('name', dto.name);
    const bussSubCategory = await this.bussSubCategoriesService.create(dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.BUSS_SUB_CATEGORY.CREATED,
      bussSubCategory,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Business Sub Categories'],
     response: { status: 200, description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED },
     softBlockExtraDtoFields: true,
   })
  @Get('admin/buss-sub-category')
  async getAll(@Res() response: Response, @Query() query: FilterQuery) {
    const bussSubCategory = await this.bussSubCategoriesService.getAll(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
      bussSubCategory,
      null,
      null,
    );
  }

   @ApiEndpoint({
     tags: ['Admin', 'Business Sub Categories'],
     response: { status: 200, description: ServerSuccess.BUSS_SUB_CATEGORY.LISTED },
     softBlockExtraDtoFields: true,
   })
  @Get('admin/buss-sub-category/:id')
   async getOne(@Res() response: Response, @Param('id') id: string) {
     const bussSubCategory = await this.bussSubCategoriesService.getOne(id);

     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.BUSS_SUB_CATEGORY.LISTED,
       bussSubCategory,
       null,
       null,
     );
   }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Business Sub Categories'],
    response: { status: 200, description: ServerSuccess.BUSS_SUB_CATEGORY.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Put('admin/buss-sub-category/:id')
   async update(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: updateBussSubCategoryDto,
   ) {
     const bussSubCategory = await this.bussSubCategoriesService.update(id, dto, req.user.id);
     await this.bussSubCategoriesService.findByFieldNameExcludeId('name', dto.name, id);
     return responseHelper(
       response,
       HttpStatus.OK,
       ServerSuccess.BUSS_SUB_CATEGORY.UPDATED,
       bussSubCategory,
       null,
       null,
     );
   }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Business Sub Categories'],
    response: { status: 200, description: ServerSuccess.BUSS_SUB_CATEGORY.DELETED },
    noAuthToken: true,
  })
  @Delete('admin/buss-sub-category/:id')
  async softDelete(
    @Req() req,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const bussSubCategory = await this.bussSubCategoriesService.softDelete(id, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.BUSS_SUB_CATEGORY.DELETED,
      bussSubCategory,
      null,
      null,
    );
  }
}
