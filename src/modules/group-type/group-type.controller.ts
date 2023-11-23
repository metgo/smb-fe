import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { GroupTypeService } from './group-type.service';
import { Response } from 'express';
import { FilterQuery, createGroupTypeDto, updateGroupTypeDto } from './dto';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { UserType } from '../users/users.type';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';

@Controller()
export class GroupTypeController {
  constructor(
        private readonly groupTypeService: GroupTypeService,
  ) { }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 201,
      description: ServerSuccess.GROUP_TYPE.CREATED,
    },
  })
  @Post('admin/group-type')
  async create(
      @Req() req,
      @Res() response: Response,
      @Body() dto: createGroupTypeDto,
  ) {
    await this.groupTypeService.findByFieldName('name', dto.name);
    const groupType = await this.groupTypeService.create(dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.GROUP_TYPE.CREATED,
      groupType,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @Get('admin/group-type')
  async getAll(@Res() response: Response, @Query() query: FilterQuery) {
    const groupType = await this.groupTypeService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.LISTED,
      groupType,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @Get('admin/group-type/:id')
  async getOne(@Res() response: Response, @Param('id') id: string) {
    const groupType = await this.groupTypeService.getOne(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.LISTED,
      groupType,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.UPDATED,
    },
  })
  @Put('admin/group-type/:id')
  async update(
      @Req() req,
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: updateGroupTypeDto,
  ) {
    await this.groupTypeService.findByFieldNameExcludeId('name', dto.name, id);
    const groupType = await this.groupTypeService.update(id, dto, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.UPDATED,
      groupType,
      null,
      null,
    );
  }

  @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.DELETED,
    },
  })
  @Delete('admin/group-type/:id')
  async delete(
        @Req() req,
        @Res() response: Response,
        @Param('id') id: string,
  ) {
    const groupType = await this.groupTypeService.softDelete(id, req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.DELETED,
      groupType,
      null,
      null,
    );
  }
}
