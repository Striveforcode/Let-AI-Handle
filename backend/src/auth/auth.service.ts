import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '@models/user/user.schema';
import { Otp, OtpDocument } from '@models/auth/otp.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '@models/auth/refresh-token.schema';
import {
  RegisterInitDto,
  RegisterVerifyDto,
  LoginInitDto,
  LoginVerifyDto,
} from '@contracts/auth/auth.contract';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  // Generate OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP (mock implementation - replace with actual email/SMS service)
  private async sendOtp(email: string, otp: string): Promise<void> {
    console.log(`Sending OTP ${otp} to ${email}`);
    // TODO: Integrate with email/SMS service
  }

  // Initialize registration
  async registerInit(dto: RegisterInitDto) {
    const { email, name, phone, countryCode } = dto;

    // Check if user already exists
    console.log(email, name, phone, countryCode);
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate OTP
    const otp = this.generateOtp();

    // Save OTP
    await this.otpModel.create({
      type: 'email',
      phoneNumber: email, // Using email as phoneNumber for email OTP
      otp,
      countryCode: countryCode || '+1',
    });

    // Send OTP
    await this.sendOtp(email, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        email,
        expiresIn: 300, // 5 minutes
      },
    };
  }

  // Verify registration OTP
  async registerVerify(dto: RegisterVerifyDto) {
    const { email, otp } = dto;

    // Find OTP
    const otpDoc = await this.otpModel.findOne({
      phoneNumber: email,
      otp,
      expireAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Create user
    const user = await this.userModel.create({
      email,
      name: 'User', // Will be updated from registration data
      isVerified: true,
    });

    // Generate tokens
    const accessToken = this.jwtService.sign({ userId: user._id });
    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: '7d' },
    );

    // Save refresh token
    await this.refreshTokenModel.create({
      refreshToken,
      accessToken,
      userId: user._id,
    });

    // Delete OTP
    await this.otpModel.deleteOne({ _id: otpDoc._id });

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          isVerified: user.isVerified,
          createdAt:
            (user as any).createdAt?.toISOString() || new Date().toISOString(),
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // Initialize login
  async loginInit(dto: LoginInitDto) {
    const { email } = dto;

    // Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate OTP
    const otp = this.generateOtp();

    // Save OTP
    await this.otpModel.create({
      type: 'email',
      phoneNumber: email,
      otp,
      countryCode: '+1',
    });

    // Send OTP
    await this.sendOtp(email, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        email,
        expiresIn: 300, // 5 minutes
      },
    };
  }

  // Verify login OTP
  async loginVerify(dto: LoginVerifyDto) {
    const { email, otp } = dto;

    // Find OTP
    const otpDoc = await this.otpModel.findOne({
      phoneNumber: email,
      otp,
      expireAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate tokens
    const accessToken = this.jwtService.sign({ userId: user._id });
    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: '7d' },
    );

    // Save refresh token
    await this.refreshTokenModel.create({
      refreshToken,
      accessToken,
      userId: user._id,
    });

    // Delete OTP
    await this.otpModel.deleteOne({ _id: otpDoc._id });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokenDoc = await this.refreshTokenModel.findOne({ refreshToken });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.jwtService.sign({ userId: payload.userId });
      const newRefreshToken = this.jwtService.sign(
        { userId: payload.userId },
        { expiresIn: '7d' },
      );

      // Update refresh token
      await this.refreshTokenModel.updateOne(
        { refreshToken },
        { refreshToken: newRefreshToken, accessToken: newAccessToken },
      );

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token', error);
    }
  }

  // Logout
  async logout(refreshToken: string) {
    await this.refreshTokenModel.deleteOne({ refreshToken });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
