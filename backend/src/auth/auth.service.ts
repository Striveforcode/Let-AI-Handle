import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  // Generate a fixed OTP for testing
  private generateOTP(): string {
    return '123456'; // Fixed OTP for development
  }

  // Register Init - Send OTP
  async registerInit(
    phoneNumber: string,
    countryCode: string,
    name: string,
    email: string,
  ) {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ phone: phoneNumber });
      if (existingUser) {
        throw new BadRequestException(
          'User already exists with this phone number',
        );
      }

      // Check if email is already taken
      const existingEmail = await this.userModel.findOne({ email });
      if (existingEmail) {
        throw new BadRequestException('Email already registered');
      }

      // Delete any existing OTP for this phone
      await this.otpModel.deleteMany({ phoneNumber, type: 'register' });

      // Generate OTP
      const otp = this.generateOTP();

      // Save OTP with user details
      const otpData = new this.otpModel({
        phoneNumber,
        otp,
        countryCode,
        type: 'register',
        expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        // Store user details temporarily
        userDetails: {
          name,
          email,
        },
      });
      await otpData.save();

      // In production, you would send SMS here
      console.log(`OTP for ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        data: {
          phoneNumber,
          countryCode,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Register Verify - Verify OTP and create user
  async registerVerify(phoneNumber: string, countryCode: string, otp: string) {
    try {
      // Find OTP record
      const otpRecord = await this.otpModel.findOne({
        phoneNumber,
        otp,
        type: 'register',
        expireAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Get user details from OTP record
      const userDetails = otpRecord.userDetails;
      if (!userDetails || !userDetails.name || !userDetails.email) {
        throw new BadRequestException(
          'User details not found. Please try registration again.',
        );
      }

      // Create new user with stored details
      const user = new this.userModel({
        name: userDetails.name,
        email: userDetails.email,
        phone: phoneNumber,
        countryCode,
        isVerified: true,
      });
      await user.save();

      // Delete the used OTP
      await this.otpModel.deleteOne({ _id: otpRecord._id });

      // Generate tokens
      const accessToken = this.jwtService.sign({ userId: user._id });
      const refreshToken = this.jwtService.sign(
        { userId: user._id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Save refresh token
      const refreshTokenDoc = new this.refreshTokenModel({
        userId: user._id,
        refreshToken,
        accessToken,
      });
      await refreshTokenDoc.save();

      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            countryCode: user.countryCode,
            isVerified: user.isVerified,
            createdAt: (user as any).createdAt,
            updatedAt: (user as any).updatedAt,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Register Resend - Resend OTP
  async registerResend(phoneNumber: string, countryCode: string) {
    try {
      // Delete any existing OTP for this phone
      await this.otpModel.deleteMany({ phoneNumber, type: 'register' });

      // Generate new OTP
      const otp = this.generateOTP();

      // Save new OTP
      const otpData = new this.otpModel({
        phoneNumber,
        otp,
        countryCode,
        type: 'register',
        expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });
      await otpData.save();

      // In production, you would send SMS here
      console.log(`New OTP for ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP resent successfully',
        data: {
          phoneNumber,
          countryCode,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Login Init - Send OTP
  async loginInit(phoneNumber: string, countryCode: string) {
    try {
      // Check if user exists
      const user = await this.userModel.findOne({ phone: phoneNumber });
      if (!user) {
        throw new BadRequestException('User not found. Please register first.');
      }

      // Generate OTP
      const otp = this.generateOTP();

      // Save OTP to database
      const otpData = new this.otpModel({
        phoneNumber,
        otp,
        countryCode,
        type: 'login',
        expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });
      await otpData.save();

      // In production, you would send SMS here
      console.log(`Login OTP for ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        data: {
          phoneNumber,
          countryCode,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Login Verify - Complete login
  async loginVerify(phoneNumber: string, countryCode: string, otp: string) {
    try {
      // Find the OTP record
      const otpRecord = await this.otpModel.findOne({
        phoneNumber,
        otp,
        type: 'login',
        expireAt: { $gt: new Date() }, // Not expired
      });

      if (!otpRecord) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Find user
      const user = await this.userModel.findOne({ phone: phoneNumber });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Delete the used OTP
      await this.otpModel.deleteOne({ _id: otpRecord._id });

      // Generate tokens
      const accessToken = this.jwtService.sign({ userId: user._id });
      const refreshToken = this.jwtService.sign(
        { userId: user._id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Save refresh token
      const refreshTokenDoc = new this.refreshTokenModel({
        userId: user._id,
        refreshToken,
        accessToken,
      });
      await refreshTokenDoc.save();

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: user._id,
            phone: user.phone,
            countryCode: user.countryCode,
            isVerified: user.isVerified,
            createdAt: (user as any).createdAt,
            updatedAt: (user as any).updatedAt,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh Token
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Check if refresh token exists in database
      const refreshTokenDoc = await this.refreshTokenModel.findOne({
        refreshToken,
        expireAt: { $gt: new Date() },
      });

      if (!refreshTokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.jwtService.sign({ userId: payload.userId });
      const newRefreshToken = this.jwtService.sign(
        { userId: payload.userId, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Update refresh token in database
      refreshTokenDoc.accessToken = newAccessToken;
      refreshTokenDoc.refreshToken = newRefreshToken;
      await refreshTokenDoc.save();

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Logout
  async logout(userId: string) {
    try {
      // Delete refresh tokens for this user
      await this.refreshTokenModel.deleteMany({ userId });

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      throw error;
    }
  }
}
