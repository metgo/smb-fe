import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/services/config/config.service';
import { QrVerificationToken } from 'src/modules/orders/schema/qr-verification-token.schema';

@Injectable()
export class QrTokenService {
  constructor(
    @InjectModel(QrVerificationToken.name)
    private readonly tokenModel: Model<QrVerificationToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(
    orderId: string,
    userId: string,
    userEmail: string,
    userRole: string,
    expiryDays: number = 30,
  ): Promise<string> {
    // Generate JWT token with user and order info
    const token = this.jwtService.sign(
      {
        orderId,
        userId,
        email: userEmail,
        role: userRole,
      },
      {
        secret: this.configService.JWT.ACCESS_TOKEN,
        expiresIn: expiryDays * 24 * 60 * 60, // 30 days in seconds
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await this.tokenModel.create({
      orderId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyToken(token: string, ipAddress?: string): Promise<string> {
    try {
      // Verify JWT signature
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.JWT.ACCESS_TOKEN,
      });

      const qrToken = await this.tokenModel.findOne({ token });

      if (!qrToken) {
        throw new NotFoundException('Invalid QR verification token');
      }

      if (qrToken.expiresAt < new Date()) {
        throw new BadRequestException('QR verification token has expired');
      }

      // Update access information
      await this.tokenModel.updateOne(
        { _id: qrToken._id },
        {
          lastAccessIp: ipAddress || null,
          lastAccessedAt: new Date(),
          $inc: { accessCount: 1 },
        },
      );

      return decoded.orderId;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('QR verification token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid QR verification token');
      }
      throw error;
    }
  }

  async revokeToken(token: string): Promise<void> {
    await this.tokenModel.updateOne({ token }, { isUsed: true });
  }

  async getTokenInfo(token: string): Promise<any> {
    const qrToken = await this.tokenModel.findOne({ token });

    if (!qrToken) {
      throw new NotFoundException('Token not found');
    }

    return {
      orderId: qrToken.orderId,
      isExpired: qrToken.expiresAt < new Date(),
      isUsed: qrToken.isUsed,
      expiresAt: qrToken.expiresAt,
      accessCount: qrToken.accessCount,
      lastAccessedAt: qrToken.lastAccessedAt,
      lastAccessIp: qrToken.lastAccessIp,
    };
  }
}
