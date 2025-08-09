# DocuThinker AI - Intelligent Document Analysis Platform

## 🚀 Project Overview

DocuThinker AI is a comprehensive document analysis platform that combines advanced AI capabilities with intuitive user experience. Users can upload PDF documents, receive AI-powered insights and summaries, and engage in intelligent conversations about their document content using state-of-the-art language models.

## ✨ Key Features

### 🔐 Authentication System

- **Secure OTP-based Authentication**: Phone number verification with SMS OTP
- **JWT Token Management**: Secure session handling with refresh tokens
- **User Profile Management**: Complete user account management

### 📄 Document Management

- **Multi-format Upload**: Support for PDF and TXT files with drag-and-drop interface
- **Intelligent Processing**: Automatic AI analysis and insight generation
- **Secure Storage**: Files stored locally with database metadata tracking
- **Real-time Status**: Live updates during document processing

### 🤖 AI-Powered Analysis

- **Comprehensive Summaries**: Detailed document summaries using Hugging Face models
- **Key Insights Extraction**: Intelligent identification of important information
- **Sentiment Analysis**: Document tone and sentiment evaluation
- **Content Chunking**: Handles large documents by intelligent content splitting

### 💬 Intelligent Chat System

- **Document-based Q&A**: Ask questions about uploaded documents
- **Context-aware Responses**: AI maintains full document context
- **Multiple AI Models**: Fallback system with generative and extractive models
- **Comprehensive Analysis**: Detailed responses using entire document content

### 🎨 Modern User Interface

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Adaptive theming for user preference
- **Real-time Feedback**: Loading states and progress indicators
- **Intuitive Navigation**: Clean, modern Material-UI design

## 🏗️ Architecture Overview

### Backend Architecture (NestJS)

```
backend/
├── src/
│   ├── auth/          # Authentication module (OTP, JWT)
│   ├── user/          # User management
│   ├── document/      # Document CRUD operations
│   ├── ai/            # AI analysis services
│   ├── chat/          # Chat functionality
│   └── main.ts        # Application entry point
├── uploads/           # File storage directory
└── dist/             # Compiled JavaScript
```

### Frontend Architecture (React)

```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Main application pages
│   ├── services/     # API communication
│   └── utils/        # Helper functions
└── public/           # Static assets
```

### Database Schema (MongoDB)

- **Users**: Authentication and profile data
- **Documents**: File metadata and AI analysis results
- **OTP**: Temporary verification codes

## 🛠️ Technology Stack

### Backend Technologies

- **NestJS**: Modern Node.js framework with TypeScript
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **Axios**: HTTP client for AI API calls

### Frontend Technologies

- **React 18**: Modern React with hooks
- **Material-UI (MUI)**: Comprehensive component library
- **React Router**: Client-side routing
- **React Dropzone**: Drag-and-drop file uploads
- **Axios**: API communication

### AI/ML Integration

- **Hugging Face Inference API**: Multiple AI models
  - `facebook/bart-large-cnn`: Text summarization
  - `google/flan-t5-base`: Text generation
  - `deepset/roberta-base-squad2`: Question answering
- **Custom Text Analysis**: Intelligent content extraction

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Hugging Face API token

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in backend directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/docuthinker

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_SECRET=your-refresh-secret-here
   JWT_REFRESH_EXPIRES_IN=7d

   # Hugging Face AI
   HUGGING_FACE_TOKEN=your-hugging-face-token-here

   # Server Configuration
   PORT=3001
   ```

4. **Build and start the server**

   ```bash
   npm run build
   node dist/backend/src/main.js
   ```

   The backend will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in frontend directory:

   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register/init` - Initialize user registration
- `POST /auth/register/verify` - Verify OTP and create account
- `POST /auth/login/init` - Initialize login process
- `POST /auth/login/verify` - Verify OTP and login
- `POST /auth/token/refresh` - Refresh access token

### Document Endpoints

- `POST /document/upload` - Upload and process document
- `GET /document/user` - Get user's documents
- `GET /document/:id` - Get specific document
- `POST /document/:id/analyze` - Trigger AI analysis

### Chat Endpoints

- `POST /chat/start/:documentId` - Start chat session
- `POST /chat/message/:sessionId` - Send message
- `GET /chat/history/:sessionId` - Get chat history

## 🤖 AI/LLM Integration

### Where LLMs are Used

1. **Document Analysis** (`backend/src/ai/ai.service.ts`)

   - **Summarization**: Uses `facebook/bart-large-cnn` for document summaries
   - **Content Processing**: Chunks large documents for token limit handling
   - **Insight Generation**: Custom algorithms for key point extraction

2. **Chat System** (`backend/src/chat/chat.service.ts`)

   - **Primary Model**: `google/flan-t5-base` for generative responses
   - **Fallback Model**: `deepset/roberta-base-squad2` for extractive Q&A
   - **Comprehensive Analysis**: Custom text analysis using full document content

3. **How LLMs Enhance the System**
   - **Context Preservation**: Full document content maintained in chat sessions
   - **Intelligent Responses**: Multi-paragraph, detailed answers
   - **Content Understanding**: Categorized responses based on question type
   - **Fallback Mechanisms**: Multiple AI approaches ensure robust responses

## 🎥 Demo Video Features

The demo video showcases:

1. **User Registration/Login** with OTP verification
2. **Document Upload** with real-time processing
3. **AI Analysis Results** showing summaries, insights, and sentiment
4. **Interactive Chat** with detailed document-based responses
5. **Document Management** with view, download, and delete operations
6. **Responsive Design** across different screen sizes

## 📁 Project Structure

```
Let-AI-Handle/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management
│   │   ├── document/       # Document operations
│   │   ├── ai/             # AI analysis services
│   │   ├── chat/           # Chat functionality
│   │   └── main.ts         # Entry point
│   ├── uploads/            # File storage
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── services/       # API services
│   └── package.json
├── models/                 # Shared data models
├── contracts/              # API contracts
└── README.md              # This file
```

## 🔧 Development Decisions

### Technology Choices

- **NestJS over Express**: Better structure, built-in TypeScript support, dependency injection
- **MongoDB over SQL**: Flexible schema for document metadata and AI results
- **Material-UI over Custom CSS**: Faster development, consistent design system
- **Hugging Face over OpenAI**: Free tier availability, multiple model options

### Security Measures

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **File Type Restrictions**: Only allow safe file types
- **Error Handling**: Secure error messages without data leakage

### Performance Optimizations

- **Content Chunking**: Handle large documents efficiently
- **Background Processing**: AI analysis doesn't block user interface
- **Caching Strategy**: Session-based chat history storage
- **Optimized Queries**: Efficient database operations

## 🚀 Future Enhancements

- **Real-time Collaboration**: Multiple users on same document
- **Advanced Analytics**: Usage statistics and insights
- **More File Formats**: Support for DOCX, images with OCR
- **Cloud Storage**: Integration with AWS S3 or Google Cloud
- **Mobile App**: Native mobile applications

## 📞 Support

For questions or issues, please refer to the comprehensive documentation or check the Git commit history for detailed implementation notes.

---

**Built with ❤️ using modern web technologies and AI**
