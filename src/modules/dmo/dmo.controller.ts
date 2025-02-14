/* eslint-disable no-undef */
import {
  Controller,
} from '@nestjs/common';

import { DMOService } from 'src/modules/dmo//dmo.service';

@Controller()
export class DMOController {
  constructor(private readonly dmoServices: DMOService) {}

  // @ApiEndpoint({
  //   tags: ['DMO'],
  //   response: {
  //     status: 200,
  //     description: ServerSuccess.DMO_LISTED,
  //   },
  //   softBlockExtraDtoFields: true,
  // })
  // @Get('admin/dmo')
  // async getAllDMO(@Res() response: Response, @Query() query: FilterQuery) {
  //   const dmo = await this.dmoServices.getAllDMO(query);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.DMO_LISTED,
  //     dmo,
  //     null,
  //     null,
  //   );
  // }
}
