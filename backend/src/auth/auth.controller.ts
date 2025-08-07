import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register Init - Send OTP
  @Post('register/init')
  async registerInit(
    @Body()
    body: {
      phoneNumber: string;
      countryCode: string;
      name: string;
      email: string;
    },
  ) {
    return this.authService.registerInit(
      body.phoneNumber,
      body.countryCode,
      body.name,
      body.email,
    );
  }

  // Register Verify - Complete registration
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  async registerVerify(
    @Body() body: { phoneNumber: string; countryCode: string; otp: string },
  ) {
    return this.authService.registerVerify(
      body.phoneNumber,
      body.countryCode,
      body.otp,
    );
  }

  // Register Resend - Resend OTP
  @Post('register/resend')
  @HttpCode(HttpStatus.OK)
  async registerResend(
    @Body() body: { phoneNumber: string; countryCode: string },
  ) {
    return this.authService.registerResend(body.phoneNumber, body.countryCode);
  }

  // Login Init - Send OTP
  @Post('login/init')
  @HttpCode(HttpStatus.OK)
  async loginInit(@Body() body: { phoneNumber: string; countryCode: string }) {
    return this.authService.loginInit(body.phoneNumber, body.countryCode);
  }

  // Login Verify - Complete login
  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  async loginVerify(
    @Body() body: { phoneNumber: string; countryCode: string; otp: string },
  ) {
    return this.authService.loginVerify(
      body.phoneNumber,
      body.countryCode,
      body.otp,
    );
  }

  // Refresh Token
  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  // Logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }
}
