import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateIconDto, UpdateIconDto } from './dto';
import { IconsService } from './icons.service';

@Controller()
export class IconsController {
  constructor(private readonly iconsService: IconsService) { }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 201,
      description: ServerSuccess.ICON_CREATED,
    },
  })
  @Post('admin/icon')
  async createIcon(@Res() response: Response, @Body() dto: CreateIconDto) {
    await this.iconsService.findByFieldName('name', dto.name);
    const newIcon = await this.iconsService.createIcon(dto);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.ICON_CREATED,
      newIcon,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_LISTED,
    },
  })
    @Get('admin/icon')
  async getIcons(@Res() response: Response) {
    const icon = await this.iconsService.getIcons();
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_LISTED,
      icon,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_LISTED,
    },
  })
  @Get('admin/icon/:id')
  async getIcon(@Res() response: Response, @Param('id') id: string) {
    const icon = await this.iconsService.getIcon(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_LISTED,
      icon,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_UPDATED,
    },
  })
  @Put('admin/icon/:id')
  async updateIcon(
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: UpdateIconDto,
  ) {
    const icon = await this.iconsService.updateIcon(id, dto);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_UPDATED,
      icon,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 200,
      description: ServerSuccess.ICON_UPDATED,
    },
  })
  @Delete('admin/icon/:id')
  async softDeleteIcon(@Res() response: Response, @Param('id') id: string) {
    const icon = await this.iconsService.softDeleteIcon(id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ICON_UPDATED,
      icon,
      null,
      null,
    );
  }
}
