import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterInitDto,
  RegisterVerifyDto,
  LoginInitDto,
  LoginVerifyDto,
  RefreshTokenDto,
  LogoutDto,
} from '@contracts/auth/auth.contract';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/init')
  @HttpCode(HttpStatus.OK)
  async registerInit(@Body() dto: RegisterInitDto) {
    return this.authService.registerInit(dto);
  }

  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  async registerVerify(@Body() dto: RegisterVerifyDto) {
    return this.authService.registerVerify(dto);
  }

  @Post('register/resend')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: RegisterInitDto) {
    return this.authService.registerInit(dto);
  }

  @Post('login/init')
  @HttpCode(HttpStatus.OK)
  async loginInit(@Body() dto: LoginInitDto) {
    return this.authService.loginInit(dto);
  }

  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  async loginVerify(@Body() dto: LoginVerifyDto) {
    return this.authService.loginVerify(dto);
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }
}
