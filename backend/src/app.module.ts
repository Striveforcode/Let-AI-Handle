import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DocumentModule } from './document/document.module';
import { ChatModule } from './chat/chat.module';
import { AiService } from './ai/ai.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/let-ai-handle'),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    UserModule,
    DocumentModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule {}
