import {
  Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res,
} from '@nestjs/common';
import { DMOService } from './dmo.service';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';
import { Response } from 'express';
import { CreateDMODto, UpdateDMODto } from './dto';
import { responseHelper } from 'src/core/helper/response.helper';

@Controller()
export class DMOController {
  constructor(private readonly dmoServices: DMOService) { }

    @ApiEndpoint({
      tags: ['Admin', 'DMO'],
      response: {
        status: 201,
        description: ServerSuccess.DMO_CREATED,
      },
    })
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
 })
    @Get('admin/dmo')
    async getAllDMO(@Res() response: Response) {
      const dmo = await this.dmoServices.getAllDMO();
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
    })
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
     })
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
}
