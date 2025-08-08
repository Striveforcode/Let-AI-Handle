import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Upload document
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: any,
    @Body() body: { title: string; description?: string; tags?: string },
    @Request() req: any,
  ) {
    console.log('🔍 DocumentController - Request headers:', req.headers);
    console.log(
      '🔍 DocumentController - Auth payload:',
      req.headers.authPayload,
    );

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    const tags = body.tags ? JSON.parse(body.tags) : [];
    const userId = req.headers.authPayload?.userId; // Changed from .sub to .userId

    console.log('🔍 DocumentController - Extracted userId:', userId);

    if (!userId) {
      console.log('❌ DocumentController - No userId found in auth payload');
      throw new BadRequestException(
        'User ID not found in authentication token',
      );
    }

    return this.documentService.uploadDocument(userId, file, {
      title: body.title,
      description: body.description,
      tags,
    });
  }

  // Get user's documents
  @Get('user')
  async getUserDocuments(@Request() req: any) {
    const userId = req.headers.authPayload.userId; // Get userId from JWT payload
    return this.documentService.getUserDocuments(userId);
  }

  // Get single document
  @Get(':documentId')
  async getDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userId = req.headers.authPayload.userId; // Get userId from JWT payload
    return this.documentService.getDocument(documentId, userId);
  }

  // Update document metadata
  @Put(':documentId')
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() updates: { title?: string; description?: string; tags?: string[] },
    @Request() req: any,
  ) {
    const userId = req.headers.authPayload.userId; // Get userId from JWT payload
    return this.documentService.updateDocument(documentId, userId, updates);
  }

  // Delete document
  @Delete(':documentId')
  async deleteDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userId = req.headers.authPayload.userId; // Get userId from JWT payload
    return this.documentService.deleteDocument(documentId, userId);
  }

  // Get document statistics
  @Get('stats/user')
  async getDocumentStats(@Request() req: any) {
    const userId = req.headers.authPayload.userId; // Get userId from JWT payload
    return this.documentService.getDocumentStats(userId);
  }
}
