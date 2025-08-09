import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { AiService } from '../ai/ai.service';
import {
  Document,
  DocumentDocument,
} from '../../../models/src/document/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private readonly aiService: AiService,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    // Fix: Use process.cwd() to get correct path regardless of build location
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  // Upload document
  async uploadDocument(
    userId: string,
    file: any, // Using any for now to avoid type issues
    metadata: {
      title: string;
      description?: string;
      tags?: string[];
    },
  ) {
    try {
      // Ensure uploads directory exists
      this.ensureUploadsDirectory();

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.originalname;
      const fileName = `${timestamp}_${originalName}`;
      // Fix: Use process.cwd() to get correct path regardless of build location
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create document record
      const document = new this.documentModel({
        userId,
        title: metadata.title,
        description: metadata.description || '',
        tags: metadata.tags || [],
        fileName: originalName,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl: `/uploads/${fileName}`, // URL for accessing the file
        filePath: filePath, // Local file path
        uploadDate: new Date(),
        status: 'uploaded',
      });

      await document.save();

      // Start AI analysis in background
      this.performAiAnalysis(document._id.toString(), filePath, originalName);

      return {
        success: true,
        message: 'Document uploaded successfully. AI analysis is in progress.',
        data: {
          document: {
            _id: document._id,
            title: document.title,
            description: document.description,
            tags: document.tags,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            fileUrl: document.fileUrl,
            uploadDate: document.uploadDate,
            status: document.status,
          },
        },
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to upload document');
    }
  }

  // Perform AI analysis in background
  private async performAiAnalysis(
    documentId: string,
    filePath: string,
    fileName: string,
  ) {
    try {
      console.log(`🚀 Starting AI analysis for document: ${documentId}`);

      await this.documentModel.findByIdAndUpdate(documentId, {
        status: 'processing',
      });

      const analysis = await this.aiService.analyzeDocument(filePath, fileName);

      // Save all AI analysis results to database
      await this.documentModel.findByIdAndUpdate(documentId, {
        status: 'processed',
        summary: analysis.summary,
        insights: analysis.insights,
        keyPoints: analysis.keyPoints,
        sentiment: analysis.sentiment,
        processedAt: new Date(),
      });

      console.log(`✅ AI analysis completed for document: ${documentId}`);
      console.log(`💾 Saved to DB:`, {
        summary: analysis.summary?.substring(0, 100) + '...',
        insightsCount: analysis.insights?.length,
        keyPointsCount: analysis.keyPoints?.length,
        sentiment: analysis.sentiment,
      });
    } catch (error) {
      console.error(`❌ AI analysis failed for document: ${documentId}`, error);
      await this.documentModel.findByIdAndUpdate(documentId, {
        status: 'error',
      });
    }
  }

  // Get user's documents
  async getUserDocuments(userId: string) {
    try {
      const documents = await this.documentModel
        .find({ userId })
        .sort({ uploadDate: -1 })
        .exec();

      return {
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          documents: documents.map((doc) => ({
            _id: doc._id,
            title: doc.title,
            description: doc.description,
            tags: doc.tags,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            fileUrl: doc.fileUrl,
            uploadDate: doc.uploadDate,
            status: doc.status,
            summary: doc.summary,
            insights: doc.insights,
            keyPoints: doc.keyPoints,
            sentiment: doc.sentiment,
            processedAt: doc.processedAt,
          })),
        },
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to retrieve documents');
    }
  }

  // Get single document
  async getDocument(documentId: string, userId: string) {
    try {
      const document = await this.documentModel.findOne({
        _id: documentId,
        userId,
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Log the retrieved document data for debugging
      console.log(`📄 Retrieved document from DB:`, {
        id: document._id,
        title: document.title,
        status: document.status,
        hasSummary: !!document.summary,
        hasInsights: !!document.insights,
        hasKeyPoints: !!document.keyPoints,
        hasSentiment: !!document.sentiment,
        processedAt: document.processedAt,
      });

      return {
        success: true,
        message: 'Document retrieved successfully',
        data: {
          document: {
            _id: document._id,
            title: document.title,
            description: document.description,
            tags: document.tags,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            fileUrl: document.fileUrl,
            uploadDate: document.uploadDate,
            status: document.status,
            summary: document.summary,
            insights: document.insights,
            keyPoints: document.keyPoints,
            sentiment: document.sentiment,
            processedAt: document.processedAt,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve document');
    }
  }

  // Update document metadata
  async updateDocument(
    documentId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
    },
  ) {
    try {
      const document = await this.documentModel.findOneAndUpdate(
        { _id: documentId, userId },
        { $set: updates },
        { new: true },
      );

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      return {
        success: true,
        message: 'Document updated successfully',
        data: {
          document: {
            _id: document._id,
            title: document.title,
            description: document.description,
            tags: document.tags,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            uploadDate: document.uploadDate,
            status: document.status,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update document');
    }
  }

  // Delete document
  async deleteDocument(documentId: string, userId: string) {
    try {
      const document = await this.documentModel.findOneAndDelete({
        _id: documentId,
        userId,
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete document');
    }
  }

  // Get document statistics
  async getDocumentStats(userId: string) {
    try {
      const totalDocuments = await this.documentModel.countDocuments({
        userId,
      });
      const totalSize = await this.documentModel.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
      ]);

      const documentsByType = await this.documentModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$fileType', count: { $sum: 1 } } },
      ]);

      return {
        success: true,
        message: 'Document statistics retrieved successfully',
        data: {
          stats: {
            totalDocuments,
            totalSize: totalSize[0]?.totalSize || 0,
            documentsByType,
          },
        },
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to retrieve document statistics');
    }
  }

  // Analyze document with AI
  async analyzeDocument(documentId: string, userId: string) {
    try {
      const document = await this.documentModel.findOne({
        _id: documentId,
        userId,
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Check if document has a file path
      if (!document.filePath) {
        throw new BadRequestException('Document file not found');
      }

      // Trigger AI analysis
      await this.performAiAnalysis(
        documentId,
        document.filePath,
        document.fileName,
      );

      return {
        success: true,
        message: 'AI analysis started successfully',
        data: {
          documentId,
          status: 'processing',
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to start AI analysis');
    }
  }
}
