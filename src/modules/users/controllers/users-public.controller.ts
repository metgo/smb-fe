import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { ServerSuccess, ServerErrors } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { QrTokenService } from 'src/services/qr-token/qr-token.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { UsersService } from '../users.services';
import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';

@Controller('public/users')
export class UsersPublicController {
  constructor(
    private readonly qrTokenService: QrTokenService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  @ApiEndpoint({
    tags: ['Public Users'],
    response: {
      status: HttpStatus.OK,
      description: 'User details fetched via QR token',
    },
    noAuthToken: true,
    operation: 'Get user details using QR verification token (no auth)',
  })
  @Get('verify/:token')
  async getUserByQrToken(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const clientIp
        = (req.headers['x-forwarded-for'] as string)?.split(',')[0]
        || req.socket.remoteAddress
        || '';

      // Verify QR token and get orderId
      const decodedToken = await this.qrTokenService.verifyToken(token, clientIp);

      const vendorOwner = await this.ordersService.getVendorOwnerForOrder(
        decodedToken.orderId,
      );

      if (!vendorOwner?.userId) {
        return responseHelper(
          response,
          HttpStatus.NOT_FOUND,
          ServerErrors.USER.NOT_FOUND,
          null,
          null,
          null,
        );
      }

      // Fetch vendor user details using the business owner's userId.
      const userInfo = await this.usersService.getUserById(vendorOwner.userId);

      if (!userInfo) {
        return responseHelper(
          response,
          HttpStatus.NOT_FOUND,
          ServerErrors.USER.NOT_FOUND,
          null,
          null,
          null,
        );
      }

      const { accessToken } = this.jwtAuthService.login({
        id: userInfo.id.toString(),
        email: userInfo.email,
        role: userInfo.role as any,
        hasBusiness: userInfo.hasBusiness,
      });

      return responseHelper(
        response,
        HttpStatus.OK,
        ServerSuccess.USER.LISTED,
        { user: userInfo, accessToken },
        null,
        null,
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
