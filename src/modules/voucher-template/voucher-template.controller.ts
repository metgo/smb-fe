/* eslint-disable no-undef */
import { Controller } from '@nestjs/common';
// import { Roles } from 'src/core/guards/authorization/roles';
// import { UserType } from '../users/users.type';
// import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
// import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
// import { ServerSuccess } from 'src/common/constant';
// import { responseHelper } from 'src/core/helper/response.helper';
// import { Response } from 'express';
import { VoucherTemplateService } from './voucher-template.service';
// import {
//   FilterQuery,
//   createVoucherTemplateDto,
//   updateVoucherTemplateDto,
// } from './dto';
// import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';
// import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class VoucherTemplateController {
  constructor(
    private readonly voucherTemplateService: VoucherTemplateService,
  ) {}

  // @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  // @UseGuards(JwtAuthGuard)
  // @ApiEndpoint({
  //   tags: ['Voucher Template'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.VOUCHER_TEMPLATE.CREATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  // })
  // @UseInterceptors(
  //   FileInterceptor('voucherImage', { fileFilter: fileFilterByExtensions }),
  // )
  // @Post('admin/voucher-template')
  // async create(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Body() dto: createVoucherTemplateDto,
  //   @UploadedFile() voucherImage: Express.Multer.File,
  // ) {
  //   await this.voucherTemplateService.findByFieldName('name', dto.name);
  //   const voucherTemplate = await this.voucherTemplateService.create(
  //     dto,
  //     req.user.id,
  //     voucherImage,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     ServerSuccess.VOUCHER_TEMPLATE.CREATED,
  //     voucherTemplate,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Voucher Template'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.VOUCHER_TEMPLATE.LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  // })
  // @Get('voucher-template')
  // async getAll(@Res() response: Response, @Query() query: FilterQuery) {
  //   const voucherTemplate = await this.voucherTemplateService.getAll(query);

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER_TEMPLATE.LISTED,
  //     voucherTemplate,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Voucher Template'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.VOUCHER_TEMPLATE.LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  // })
  // @Get('voucher-template/:id')
  // async getOne(@Res() response: Response, @Param('id') id: string) {
  //   const voucherTemplate = await this.voucherTemplateService.getOne(id);

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER_TEMPLATE.LISTED,
  //     voucherTemplate,
  //     null,
  //     null,
  //   );
  // }

  // @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  // @UseGuards(JwtAuthGuard)
  // @ApiEndpoint({
  //   tags: ['Voucher Template'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.VOUCHER_TEMPLATE.UPDATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  // })
  // @UseInterceptors(
  //   FileInterceptor('newIcon', { fileFilter: fileFilterByExtensions }),
  // )
  // @Put('admin/voucher-template/:id')
  // async update(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Param('id') id: string,
  //   @Body() dto: updateVoucherTemplateDto,
  //   @UploadedFile() newImage: Express.Multer.File,
  // ) {
  //   await this.voucherTemplateService.findByFieldNameExcludeId(
  //     'name',
  //     dto.name,
  //     id,
  //   );
  //   const voucherTemplate = await this.voucherTemplateService.update(
  //     id,
  //     dto,
  //     req.user.id,
  //     newImage,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER_TEMPLATE.UPDATED,
  //     voucherTemplate,
  //     null,
  //     null,
  //   );
  // }

  // @Roles(UserType.SUPERADMIN, UserType.ADMIN)
  // @UseGuards(JwtAuthGuard)
  // @ApiEndpoint({
  //   tags: ['Voucher Template'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.VOUCHER_TEMPLATE.DELETED,
  //   },
  //   noAuthToken: true,
  // })
  // @Delete('admin/voucher-template/:id')
  // async softDelete(
  //   @Req() req,
  //   @Res() response: Response,
  //   @Param('id') id: string,
  // ) {
  //   const voucherTemplate = await this.voucherTemplateService.softDelete(
  //     id,
  //     req.user.id,
  //   );
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.VOUCHER_TEMPLATE.DELETED,
  //     voucherTemplate,
  //     null,
  //     null,
  //   );
  // }
}
