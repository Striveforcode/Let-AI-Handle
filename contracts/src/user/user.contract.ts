import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Base response schema
const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// User profile schemas
const getUserProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    email: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    countryCode: z.string().optional(),
    isVerified: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

const updateUserProfileReqSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
});

const updateUserProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    email: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    countryCode: z.string().optional(),
    isVerified: z.boolean(),
    updatedAt: z.string(),
  }),
});

// User statistics schemas
const getUserStatsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    totalDocuments: z.number(),
    totalChats: z.number(),
    totalInsights: z.number(),
    lastActive: z.string().optional(),
  }),
});

// User documents list schema
const getUserDocumentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    documents: z.array(
      z.object({
        _id: z.string(),
        title: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        isProcessed: z.boolean(),
        summary: z.string().optional(),
        insights: z.array(z.string()).optional(),
        createdAt: z.string(),
        processedAt: z.string().optional(),
      })
    ),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});

// User chats list schema
const getUserChatsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    chats: z.array(
      z.object({
        _id: z.string(),
        title: z.string(),
        isActive: z.boolean(),
        messageCount: z.number(),
        lastMessageAt: z.string().optional(),
        createdAt: z.string(),
      })
    ),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});

// Delete user account schema
const deleteUserAccountReqSchema = z.object({
  password: z.string().optional(), // For future password-based deletion
  reason: z.string().optional(),
});

// Export types
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileReqSchema>;
export type DeleteUserAccountDto = z.infer<typeof deleteUserAccountReqSchema>;

export const UserContract = c.router({
  // Get user profile
  getUserProfile: {
    method: "GET",
    path: "/user/profile",
    responses: {
      200: getUserProfileResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get current user profile",
  },

  // Update user profile
  updateUserProfile: {
    method: "PUT",
    path: "/user/profile",
    body: updateUserProfileReqSchema,
    responses: {
      200: updateUserProfileResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Update user profile",
  },

  // Get user statistics
  getUserStats: {
    method: "GET",
    path: "/user/stats",
    responses: {
      200: getUserStatsResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get user statistics and activity",
  },

  // Get user documents
  getUserDocuments: {
    method: "GET",
    path: "/user/documents",
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      search: z.string().optional(),
      fileType: z.string().optional(),
      isProcessed: z.string().optional(),
    }),
    responses: {
      200: getUserDocumentsResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get user's uploaded documents",
  },

  // Get user chats
  getUserChats: {
    method: "GET",
    path: "/user/chats",
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      isActive: z.string().optional(),
    }),
    responses: {
      200: getUserChatsResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get user's chat conversations",
  },

  // Delete user account
  deleteUserAccount: {
    method: "DELETE",
    path: "/user/account",
    body: deleteUserAccountReqSchema,
    responses: {
      200: baseResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Delete user account and all associated data",
  },
});
