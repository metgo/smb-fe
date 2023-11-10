/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { BusinessMediaServices } from 'src/modules/business-media/business-media.service';
import { DeleteMediaDTO } from 'src/modules/business-media/dto/delete.dto';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@ApiTags('Business Media')
@UseGuards(JwtAuthGuard)
@Controller('media/business')
export class BusinessMediaController {
  constructor(
        private readonly businessMediaServices: BusinessMediaServices,
  ) {}

  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: responseHelper })
  @ApiParam({
    name: 'businessId',
    type: 'string',
    required: true,
  })
  @ApiOperation({ summary: 'Upload image for business' })
  @Post(':businessId')
  async createMedia(
    @Param('businessId') businessId: string,
    @Req() req,
    @Res() response: Response,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const media = await this.businessMediaServices.create(businessId, req.user.id, files);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.MEDIA.UPLOADED,
      media,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: responseHelper })
  @ApiParam({
    name: 'businessId',
    type: 'string',
    required: true,
  })
  @ApiOperation({ summary: 'Delete image for business' })
  @Delete(':businessId')
  async deleteMedia(
    @Body() body: DeleteMediaDTO,
    @Param('businessId') businessId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const media = await this.businessMediaServices.delete(req.user.id, businessId, body);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.MEDIA.DELETED,
      media,
      null,
      null,
    );
  }
}
