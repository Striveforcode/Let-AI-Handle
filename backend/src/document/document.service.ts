import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Document,
  DocumentDocument,
} from '../../../models/src/document/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {}

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
      const document = new this.documentModel({
        userId,
        title: metadata.title,
        description: metadata.description || '',
        tags: metadata.tags || [],
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: file.path, // In production, this would be a cloud storage URL
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
