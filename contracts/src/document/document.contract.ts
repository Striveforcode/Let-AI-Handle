import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Base response schema
const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Document upload schemas
const uploadDocumentReqSchema = z.object({
  title: z.string().min(1),
  file: z.any(), // File object for multipart/form-data
});

const uploadDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    title: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileUrl: z.string(),
    isProcessed: z.boolean(),
    createdAt: z.string(),
  }),
});

// Document processing schemas
const processDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    title: z.string(),
    summary: z.string(),
    insights: z.array(z.string()),
    isProcessed: z.boolean(),
    processedAt: z.string(),
  }),
});

// Document details schema
const getDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    title: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileUrl: z.string(),
    summary: z.string().optional(),
    insights: z.array(z.string()).optional(),
    isProcessed: z.boolean(),
    createdAt: z.string(),
    processedAt: z.string().optional(),
  }),
});

// Document list schema
const getDocumentsResponseSchema = z.object({
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

// Document update schema
const updateDocumentReqSchema = z.object({
  title: z.string().min(1).optional(),
});

const updateDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    title: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileUrl: z.string(),
    summary: z.string().optional(),
    insights: z.array(z.string()).optional(),
    isProcessed: z.boolean(),
    updatedAt: z.string(),
  }),
});

// Document insights schema
const generateInsightsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    insights: z.array(z.string()),
    generatedAt: z.string(),
  }),
});

// Document summary schema
const generateSummaryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    summary: z.string(),
    generatedAt: z.string(),
  }),
});

// Export types
export type UploadDocumentDto = z.infer<typeof uploadDocumentReqSchema>;
export type UpdateDocumentDto = z.infer<typeof updateDocumentReqSchema>;

export const DocumentContract = c.router({
  // Upload document
  uploadDocument: {
    method: "POST",
    path: "/documents/upload",
    body: uploadDocumentReqSchema,
    responses: {
      201: uploadDocumentResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      413: baseResponseSchema, // File too large
      500: baseResponseSchema,
    },
    summary: "Upload a new document",
  },

  // Get all documents
  getDocuments: {
    method: "GET",
    path: "/documents",
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
      search: z.string().optional(),
      fileType: z.string().optional(),
      isProcessed: z.string().optional(),
      sortBy: z.string().optional().default("createdAt"),
      sortOrder: z.string().optional().default("desc"),
    }),
    responses: {
      200: getDocumentsResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get all documents with pagination and filters",
  },

  // Get single document
  getDocument: {
    method: "GET",
    path: "/documents/:id",
    responses: {
      200: getDocumentResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Get document by ID",
  },

  // Update document
  updateDocument: {
    method: "PUT",
    path: "/documents/:id",
    body: updateDocumentReqSchema,
    responses: {
      200: updateDocumentResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Update document details",
  },

  // Delete document
  deleteDocument: {
    method: "DELETE",
    path: "/documents/:id",
    responses: {
      200: baseResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Delete document",
  },

  // Process document (AI processing)
  processDocument: {
    method: "POST",
    path: "/documents/:id/process",
    body: z.object({}),
    responses: {
      200: processDocumentResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Process document with AI for summary and insights",
  },

  // Generate insights
  generateInsights: {
    method: "POST",
    path: "/documents/:id/insights",
    body: z.object({}),
    responses: {
      200: generateInsightsResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Generate AI insights for document",
  },

  // Generate summary
  generateSummary: {
    method: "POST",
    path: "/documents/:id/summary",
    body: z.object({}),
    responses: {
      200: generateSummaryResponseSchema,
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Generate AI summary for document",
  },

  // Download document
  downloadDocument: {
    method: "GET",
    path: "/documents/:id/download",
    responses: {
      200: z.any(), // File stream
      401: baseResponseSchema,
      404: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Download document file",
  },
});
