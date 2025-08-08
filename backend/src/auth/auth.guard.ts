import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(
      '🔍 AuthGuard - Authorization header:',
      request.headers.authorization,
    );
    console.log('🔍 AuthGuard - Token type:', type);
    console.log(
      '🔍 AuthGuard - Token:',
      token ? token.substring(0, 20) + '...' : 'undefined',
    );
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log(
      '🔍 AuthGuard - Extracted token:',
      token ? 'present' : 'missing',
    );

    if (!token) {
      console.log('❌ AuthGuard - No token found');
      throw new UnauthorizedException('No valid authorization token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      console.log('✅ AuthGuard - Token verified successfully');
      console.log('🔍 AuthGuard - Payload:', payload);

      // Add the payload to request headers so controllers can access it
      request.headers['authPayload'] = payload;
    } catch (error) {
      console.log('❌ AuthGuard - Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
