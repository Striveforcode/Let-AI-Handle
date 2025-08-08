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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

@Controller('document')
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
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    const tags = body.tags ? JSON.parse(body.tags) : [];

    return this.documentService.uploadDocument(req.user.userId, file, {
      title: body.title,
      description: body.description,
      tags,
    });
  }

  // Get user's documents
  @Get('user')
  async getUserDocuments(@Request() req: any) {
    return this.documentService.getUserDocuments(req.user.userId);
  }

  // Get single document
  @Get(':documentId')
  async getDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    return this.documentService.getDocument(documentId, req.user.userId);
  }

  // Update document metadata
  @Put(':documentId')
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() updates: { title?: string; description?: string; tags?: string[] },
    @Request() req: any,
  ) {
    return this.documentService.updateDocument(
      documentId,
      req.user.userId,
      updates,
    );
  }

  // Delete document
  @Delete(':documentId')
  async deleteDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    return this.documentService.deleteDocument(documentId, req.user.userId);
  }

  // Get document statistics
  @Get('stats/user')
  async getDocumentStats(@Request() req: any) {
    return this.documentService.getDocumentStats(req.user.userId);
  }
}
