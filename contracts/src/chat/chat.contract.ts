import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Base response schema
const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Chat message schema
const chatMessageSchema = z.object({
  _id: z.string(),
  role: z.enum(["user", "ai"]),
  content: z.string(),
  timestamp: z.string(),
  isError: z.boolean().optional(),
});

// Create chat request schema
const createChatReqSchema = z.object({
  title: z.string().min(1),
});

const createChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    title: z.string(),
    isActive: z.boolean(),
    messageCount: z.number(),
    createdAt: z.string(),
  }),
});

// Get chat response schema
const getChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    title: z.string(),
    messages: z.array(chatMessageSchema),
    isActive: z.boolean(),
    lastMessageAt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

// Get chats list response schema
const getChatsResponseSchema = z.object({
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

// Send message request schema
const sendMessageReqSchema = z.object({
  content: z.string().min(1),
  documentId: z.string().optional(), // Optional reference to a document
});

const sendMessageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    chatId: z.string(),
    message: chatMessageSchema,
    aiResponse: chatMessageSchema.optional(), // AI response if available
  }),
});

// Update chat request schema
const updateChatReqSchema = z.object({
  title: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

const updateChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    title: z.string(),
    isActive: z.boolean(),
    updatedAt: z.string(),
  }),
});

// Chat insights schema
const getChatInsightsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    chatId: z.string(),
    insights: z.array(z.string()),
    generatedAt: z.string(),
  }),
});

// Export types
export type CreateChatDto = z.infer<typeof createChatReqSchema>;
export type SendMessageDto = z.infer<typeof sendMessageReqSchema>;
export type UpdateChatDto = z.infer<typeof updateChatReqSchema>;

export const ChatContract = c.router({
  // Create new chat
  createChat: {
    method: "POST",
    path: "/chats",
    body: createChatReqSchema,
    responses: {
      201: createChatResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Create a new chat conversation",
  },

  // Get all chats
  getChats: {
    method: "GET",
    path: "/chats",
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      isActive: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.string().optional().default("lastMessageAt"),
      sortOrder: z.string().optional().default("desc"),
    }),
    responses: {
      200: getChatsResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get all chat conversations with pagination and filters",
  },

  // Get single chat
  getChat: {
    method: "GET",
    path: "/chats/:id",
    responses: {
      200: getChatResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get chat by ID with all messages",
  },

  // Update chat
  updateChat: {
    method: "PUT",
    path: "/chats/:id",
    body: updateChatReqSchema,
    responses: {
      200: updateChatResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Update chat details (title, active status)",
  },

  // Delete chat
  deleteChat: {
    method: "DELETE",
    path: "/chats/:id",
    responses: {
      200: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Delete chat and all messages",
  },

  // Send message
  sendMessage: {
    method: "POST",
    path: "/chats/:id/messages",
    body: sendMessageReqSchema,
    responses: {
      200: sendMessageResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Send a message to AI and get response",
  },

  // Get chat messages
  getChatMessages: {
    method: "GET",
    path: "/chats/:id/messages",
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("50"),
      before: z.string().optional(), // Message ID to get messages before
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.object({
          messages: z.array(chatMessageSchema),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
        }),
      }),
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get chat messages with pagination",
  },

  // Generate chat insights
  generateChatInsights: {
    method: "POST",
    path: "/chats/:id/insights",
    body: z.object({}),
    responses: {
      200: getChatInsightsResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Generate AI insights from chat conversation",
  },

  // Clear chat messages
  clearChatMessages: {
    method: "DELETE",
    path: "/chats/:id/messages",
    responses: {
      200: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Clear all messages in a chat",
  },

  // Archive chat
  archiveChat: {
    method: "POST",
    path: "/chats/:id/archive",
    body: z.object({}),
    responses: {
      200: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Archive a chat (set isActive to false)",
  },

  // Reactivate chat
  reactivateChat: {
    method: "POST",
    path: "/chats/:id/reactivate",
    body: z.object({}),
    responses: {
      200: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Reactivate an archived chat",
  },
});
