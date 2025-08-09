# DocuThinker AI - API Documentation

## 🔗 Base URL

```
http://localhost:3001
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📱 Authentication Endpoints

### 1. Initialize Registration

**POST** `/auth/register/init`

Start the user registration process by sending an OTP to the provided phone number.

**Request Body:**

```json
{
  "phoneNumber": "9315526148",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "9315526148",
    "otpExpiry": "2025-01-08T10:30:00.000Z"
  }
}
```

### 2. Verify Registration

**POST** `/auth/register/verify`

Complete registration by verifying the OTP and create user account.

**Request Body:**

```json
{
  "phoneNumber": "9315526148",
  "otp": "123456",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a1234567890a",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "9315526148"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Initialize Login

**POST** `/auth/login/init`

Start the login process by sending an OTP to registered phone number.

**Request Body:**

```json
{
  "phoneNumber": "9315526148"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "9315526148",
    "otpExpiry": "2025-01-08T10:35:00.000Z"
  }
}
```

### 4. Verify Login

**POST** `/auth/login/verify`

Complete login by verifying the OTP.

**Request Body:**

```json
{
  "phoneNumber": "9315526148",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a1234567890a",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "9315526148"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 5. Refresh Token

**POST** `/auth/token/refresh`

Get a new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6. Logout

**POST** `/auth/logout`

Logout user and invalidate tokens.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 📄 Document Endpoints

### 1. Upload Document

**POST** `/document/upload`

Upload a document file with metadata for AI analysis.

**Headers:**

```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```
file: <PDF or TXT file>
title: "My Resume"
description: "Personal resume document"
tags: ["resume", "career"]
```

**Response:**

```json
{
  "success": true,
  "message": "Document uploaded successfully. AI analysis is in progress.",
  "data": {
    "document": {
      "_id": "60d5ecb54b24a1234567890b",
      "title": "My Resume",
      "description": "Personal resume document",
      "tags": ["resume", "career"],
      "fileName": "1754736744551_resume.pdf",
      "fileSize": 119685,
      "fileType": "application/pdf",
      "fileUrl": "/uploads/1754736744551_resume.pdf",
      "uploadDate": "2025-01-08T10:40:00.000Z",
      "status": "uploaded"
    }
  }
}
```

### 2. Get User Documents

**GET** `/document/user`

Retrieve all documents belonging to the authenticated user.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "_id": "60d5ecb54b24a1234567890b",
        "title": "My Resume",
        "description": "Personal resume document",
        "tags": ["resume", "career"],
        "fileName": "1754736744551_resume.pdf",
        "fileSize": 119685,
        "fileType": "application/pdf",
        "fileUrl": "/uploads/1754736744551_resume.pdf",
        "uploadDate": "2025-01-08T10:40:00.000Z",
        "status": "processed",
        "summary": "This document is a resume for John Doe...",
        "insights": [
          "Strong technical background in web development",
          "Experience with modern frameworks and tools"
        ],
        "keyPoints": [
          "5+ years of software development experience",
          "Proficient in React, Node.js, and MongoDB"
        ],
        "sentiment": "Professional and confident",
        "processedAt": "2025-01-08T10:41:30.000Z"
      }
    ]
  }
}
```

### 3. Get Specific Document

**GET** `/document/:documentId`

Retrieve details of a specific document.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Document retrieved successfully",
  "data": {
    "document": {
      "_id": "60d5ecb54b24a1234567890b",
      "title": "My Resume",
      "description": "Personal resume document",
      "tags": ["resume", "career"],
      "fileName": "1754736744551_resume.pdf",
      "fileSize": 119685,
      "fileType": "application/pdf",
      "fileUrl": "/uploads/1754736744551_resume.pdf",
      "uploadDate": "2025-01-08T10:40:00.000Z",
      "status": "processed",
      "summary": "This document is a resume for John Doe, a software developer with 5+ years of experience...",
      "insights": [
        "Strong technical background in web development",
        "Experience with modern frameworks and tools",
        "Good problem-solving and analytical skills"
      ],
      "keyPoints": [
        "5+ years of software development experience",
        "Proficient in React, Node.js, and MongoDB",
        "Led multiple successful projects"
      ],
      "sentiment": "Professional and confident",
      "processedAt": "2025-01-08T10:41:30.000Z"
    }
  }
}
```

### 4. Update Document

**PUT** `/document/:documentId`

Update document metadata.

**Headers:**

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Updated Resume",
  "description": "Updated description",
  "tags": ["resume", "career", "updated"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "document": {
      "_id": "60d5ecb54b24a1234567890b",
      "title": "Updated Resume",
      "description": "Updated description",
      "tags": ["resume", "career", "updated"]
    }
  }
}
```

### 5. Delete Document

**DELETE** `/document/:documentId`

Delete a document and its associated file.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### 6. Trigger AI Analysis

**POST** `/document/:documentId/analyze`

Manually trigger AI analysis for a document.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "AI analysis started successfully",
  "data": {
    "documentId": "60d5ecb54b24a1234567890b",
    "status": "processing"
  }
}
```

---

## 💬 Chat Endpoints

### 1. Start Chat Session

**POST** `/chat/start/:documentId`

Initialize a chat session for a specific document.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Chat session started successfully",
  "data": {
    "sessionId": "60d5ecb54b24a1234567890a_60d5ecb54b24a1234567890b",
    "documentTitle": "My Resume",
    "messages": [
      {
        "role": "assistant",
        "content": "Hello! I've analyzed your document \"My Resume\". You can now ask me questions about its content, and I'll provide answers based on the document.",
        "timestamp": "2025-01-08T10:45:00.000Z"
      }
    ]
  }
}
```

### 2. Send Message

**POST** `/chat/message/:sessionId`

Send a message in an existing chat session.

**Headers:**

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Where is the person currently employed?"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messages": [
      {
        "role": "assistant",
        "content": "Hello! I've analyzed your document \"My Resume\"...",
        "timestamp": "2025-01-08T10:45:00.000Z"
      },
      {
        "role": "user",
        "content": "Where is the person currently employed?",
        "timestamp": "2025-01-08T10:46:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Based on the resume, here's the detailed employment information:\n\nBackend Engineer - Game Theory\nJuly 2025 - Present Bangalore\n• Architected and deployed the reqAppVersion system to enforce backward compatibility...",
        "timestamp": "2025-01-08T10:46:15.000Z"
      }
    ]
  }
}
```

### 3. Get Chat History

**GET** `/chat/history/:sessionId`

Retrieve the complete chat history for a session.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "data": {
    "messages": [
      {
        "role": "assistant",
        "content": "Hello! I've analyzed your document...",
        "timestamp": "2025-01-08T10:45:00.000Z"
      },
      {
        "role": "user",
        "content": "Where is the person currently employed?",
        "timestamp": "2025-01-08T10:46:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Based on the resume, here's the detailed employment information...",
        "timestamp": "2025-01-08T10:46:15.000Z"
      }
    ]
  }
}
```

---

## 👤 User Endpoints

### 1. Get User Profile

**GET** `/user/profile`

Retrieve authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a1234567890a",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "9315526148",
      "createdAt": "2025-01-08T09:00:00.000Z",
      "updatedAt": "2025-01-08T09:00:00.000Z"
    }
  }
}
```

### 2. Update User Profile

**PUT** `/user/profile`

Update user profile information.

**Headers:**

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a1234567890a",
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "phoneNumber": "9315526148"
    }
  }
}
```

---

## ⚠️ Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request data",
  "error": "Validation failed"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Document not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Something went wrong"
}
```

---

## 📝 Notes

1. **File Upload Limits**: Maximum file size is 10MB
2. **Supported File Types**: PDF, TXT
3. **Rate Limiting**: AI analysis requests are rate-limited to prevent abuse
4. **Token Expiry**: Access tokens expire in 1 hour, refresh tokens in 7 days
5. **OTP Expiry**: OTP codes expire in 5 minutes
6. **Chat Sessions**: Chat sessions are stored in memory and persist until server restart

---

## 🔧 Testing the API

### Using cURL

**Register a new user:**

```bash
curl -X POST http://localhost:3001/auth/register/init \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9315526148", "name": "John Doe", "email": "john@example.com"}'
```

**Upload a document:**

```bash
curl -X POST http://localhost:3001/document/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "title=My Document" \
  -F "description=Test document" \
  -F "tags=test,document"
```

### Using Postman

Import the following collection structure:

1. Create environment variables for `baseUrl` and `authToken`
2. Set up authentication flow with OTP verification
3. Test document upload and AI analysis
4. Test chat functionality with uploaded documents

---

**For more details, refer to the main README.md file.**
