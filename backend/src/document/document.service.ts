import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  DocumentDocument,
} from '../../../models/src/document/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
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
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);

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

      return {
        success: true,
        message: 'Document uploaded successfully',
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
            uploadDate: doc.uploadDate,
            status: doc.status,
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
            uploadDate: document.uploadDate,
            status: document.status,
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
}
