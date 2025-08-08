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
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserIdFromToken(req: any): string {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'No valid authorization token provided',
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = this.jwtService.verify(token);

      if (!decoded.userId) {
        throw new UnauthorizedException('Invalid token: no userId found');
      }

      return decoded.userId;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

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
    const userId = this.extractUserIdFromToken(req);

    return this.documentService.uploadDocument(userId, file, {
      title: body.title,
      description: body.description,
      tags,
    });
  }

  // Get user's documents
  @Get('user')
  async getUserDocuments(@Request() req: any) {
    const userId = this.extractUserIdFromToken(req);
    return this.documentService.getUserDocuments(userId);
  }

  // Get single document
  @Get(':documentId')
  async getDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userId = this.extractUserIdFromToken(req);
    return this.documentService.getDocument(documentId, userId);
  }

  // Update document metadata
  @Put(':documentId')
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() updates: { title?: string; description?: string; tags?: string[] },
    @Request() req: any,
  ) {
    const userId = this.extractUserIdFromToken(req);
    return this.documentService.updateDocument(documentId, userId, updates);
  }

  // Delete document
  @Delete(':documentId')
  async deleteDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userId = this.extractUserIdFromToken(req);
    return this.documentService.deleteDocument(documentId, userId);
  }

  // Get document statistics
  @Get('stats/user')
  async getDocumentStats(@Request() req: any) {
    const userId = this.extractUserIdFromToken(req);
    return this.documentService.getDocumentStats(userId);
  }
}
