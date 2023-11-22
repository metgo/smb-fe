/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateIconDto, FilterQuery, UpdateIconDto } from './dto';
import { IconsService } from './icons.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller('admin/icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) { }

  @ApiEndpoint({
    tags: ['Admin', 'Icon'],
    response: {
      status: 201,
      description: ServerSuccess.ICON_CREATED,
    },
  })
  @UseInterceptors(FileInterceptor('icon', { fileFilter: fileFilterByExtensions }))
  @Post('')
  async createIcon(
    @Res() response: Response,
    @Body() dto: CreateIconDto,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    await this.iconsService.findByFieldName('name', dto.name);

    const newIcon = await this.iconsService.createIcon(dto, icon);
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
    @Get('')
  async getIcons(@Res() response: Response, @Query() query:FilterQuery) {
    const icon = await this.iconsService.getIcons(query);
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
  @Get('/:id')
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
  @UseInterceptors(FileInterceptor('newIcon', { fileFilter: fileFilterByExtensions }))
  @Put('/:id')
  async updateIcon(
      @Res() response: Response,
      @Param('id') id: string,
      @Body() dto: UpdateIconDto,
    @UploadedFile() newIcon: Express.Multer.File,
  ) {
    await this.iconsService.findByFieldNameExcludeId('name', dto.name, id);
    const icon = await this.iconsService.updateIcon(id, dto, newIcon);
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
  @Delete('/:id')
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
