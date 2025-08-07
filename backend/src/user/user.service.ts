import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@models/user/user.schema';
import { Document, DocumentDocument } from '@models/document/document.schema';
import { Chat, ChatDocument } from '@models/chat/chat.schema';
import { UpdateUserProfileDto } from '@contracts/user/user.contract';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  // Get user profile
  async getUserProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        countryCode: user.countryCode,
        isVerified: user.isVerified,
        createdAt:
          (user as any).createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          (user as any).updatedAt?.toISOString() || new Date().toISOString(),
      },
    };
  }

  // Update user profile
  async updateUserProfile(userId: string, dto: UpdateUserProfileDto) {
    const { name, phone, countryCode } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (countryCode !== undefined) user.countryCode = countryCode;

    await user.save();

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        countryCode: user.countryCode,
        isVerified: user.isVerified,
        updatedAt:
          (user as any).updatedAt?.toISOString() || new Date().toISOString(),
      },
    };
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count documents
    const totalDocuments = await this.documentModel.countDocuments({ userId });

    // Count chats
    const totalChats = await this.chatModel.countDocuments({ userId });

    // Count insights (sum of insights arrays from documents)
    const documentsWithInsights = await this.documentModel.find({
      userId,
      insights: { $exists: true, $ne: [] },
    });
    const totalInsights = documentsWithInsights.reduce(
      (sum, doc) => sum + (doc.insights?.length || 0),
      0,
    );

    // Get last active time (last document or chat activity)
    const lastDocument = await this.documentModel
      .findOne({ userId })
      .sort({ createdAt: -1 });
    const lastChat = await this.chatModel
      .findOne({ userId })
      .sort({ lastMessageAt: -1 });

    let lastActive = null;
    if (lastDocument && lastChat) {
      lastActive = new Date(
        Math.max(
          new Date((lastDocument as any).createdAt).getTime(),
          new Date(
            lastChat.lastMessageAt || (lastChat as any).createdAt,
          ).getTime(),
        ),
      ).toISOString();
    } else if (lastDocument) {
      lastActive = (lastDocument as any).createdAt.toISOString();
    } else if (lastChat) {
      lastActive = (
        lastChat.lastMessageAt || (lastChat as any).createdAt
      ).toISOString();
    }

    return {
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        totalDocuments,
        totalChats,
        totalInsights,
        lastActive,
      },
    };
  }

  // Get user documents
  async getUserDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    fileType?: string,
    isProcessed?: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build query
    const query: any = { userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }
    if (fileType) query.fileType = fileType;
    if (isProcessed !== undefined) query.isProcessed = isProcessed === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const documents = await this.documentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.documentModel.countDocuments(query);

    return {
      success: true,
      message: 'User documents retrieved successfully',
      data: {
        documents: documents.map((doc) => ({
          _id: doc._id.toString(),
          title: doc.title,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          isProcessed: doc.isProcessed,
          summary: doc.summary,
          insights: doc.insights,
          createdAt: (doc as any).createdAt.toISOString(),
          processedAt: doc.processedAt?.toISOString(),
        })),
        total,
        page,
        limit,
      },
    };
  }

  // Get user chats
  async getUserChats(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isActive?: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build query
    const query: any = { userId };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const chats = await this.chatModel
      .find(query)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.chatModel.countDocuments(query);

    return {
      success: true,
      message: 'User chats retrieved successfully',
      data: {
        chats: chats.map((chat) => ({
          _id: chat._id.toString(),
          title: chat.title,
          isActive: chat.isActive,
          messageCount: chat.messages?.length || 0,
          lastMessageAt: chat.lastMessageAt?.toISOString(),
          createdAt: (chat as any).createdAt.toISOString(),
        })),
        total,
        page,
        limit,
      },
    };
  }

  // Delete user account
  async deleteUserAccount(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all user data
    await Promise.all([
      this.documentModel.deleteMany({ userId }),
      this.chatModel.deleteMany({ userId }),
      this.userModel.deleteOne({ _id: userId }),
    ]);

    return {
      success: true,
      message: 'User account deleted successfully',
    };
  }
}
