import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start/:documentId')
  async startChatSession(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userId = req.headers.authPayload.userId;
    return this.chatService.startChatSession(documentId, userId);
  }

  @Post('message/:sessionId')
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() body: { message: string },
  ) {
    return this.chatService.sendMessage(sessionId, body.message);
  }

  @Get('history/:sessionId')
  async getChatHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(sessionId);
  }
}
