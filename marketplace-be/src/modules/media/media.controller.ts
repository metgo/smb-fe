/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { DeleteMediaDTO } from 'src/modules/media/dto/delete.dto';
import { UploadDTO } from 'src/modules/media/dto/upload.dto';
import { MediaServices } from 'src/modules/media/media.service';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaServices: MediaServices) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Media'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.MEDIA.UPLOADED,
    },
    operation: 'Upload images',
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createMedia(
    @Body() body: UploadDTO,
    @Req() req,
    @Res() response: Response,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const media = await this.mediaServices.create(req.user, files, body);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.MEDIA.UPLOADED,
      media,
      null,
      null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Media'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.MEDIA.DELETED,
    },
    operation: 'Delete an image',
    noAuthToken: true,
    softBlockExtraDtoFields: true,
  })
  @Delete()
  async deleteMedia(
    @Body() body: DeleteMediaDTO,
    @Req() req,
    @Res() response: Response,
  ) {
    const media = await this.mediaServices.delete(req.user, body);
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
