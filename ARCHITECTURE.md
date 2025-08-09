# DocuThinker AI - Architecture Overview

## 🏗️ System Architecture

DocuThinker AI follows a modern **3-tier architecture** with clear separation of concerns, ensuring scalability, maintainability, and security.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Services   │
                    │ (Hugging Face)  │
                    └─────────────────┘
```

## 🎯 Design Principles

### 1. **Modular Architecture**
- Clear separation between authentication, document management, and AI services
- Each module has its own controller, service, and data models
- Dependency injection for loose coupling

### 2. **Scalable Design**
- Stateless backend services
- Background processing for AI analysis
- Chunking strategy for large document processing

### 3. **Security-First Approach**
- JWT-based authentication with refresh tokens
- Input validation at all entry points
- Secure file handling and storage

### 4. **User Experience Focused**
- Real-time feedback during document processing
- Progressive loading and error handling
- Responsive design for all devices

## 🔧 Backend Architecture (NestJS)

### Core Modules

```
backend/src/
├── auth/                   # Authentication & Authorization
│   ├── auth.controller.ts  # OTP-based auth endpoints
│   ├── auth.service.ts     # Authentication logic
│   ├── auth.guard.ts       # JWT validation middleware
│   └── auth.module.ts      # Module configuration
├── user/                   # User Management
│   ├── user.controller.ts  # User profile endpoints
│   ├── user.service.ts     # User operations
│   └── user.module.ts      # Module configuration
├── document/               # Document Management
│   ├── document.controller.ts  # File upload/retrieval
│   ├── document.service.ts     # Document operations
│   └── document.module.ts      # Module configuration
├── ai/                     # AI Analysis Services
│   ├── ai.service.ts       # AI integration logic
│   └── ai.module.ts        # Module configuration
├── chat/                   # Chat Functionality
│   ├── chat.controller.ts  # Chat endpoints
│   ├── chat.service.ts     # Chat logic & AI responses
│   └── chat.module.ts      # Module configuration
└── main.ts                 # Application bootstrap
```

### Key Design Patterns

#### 1. **Module Pattern**
Each feature is encapsulated in its own NestJS module with:
- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic
- **Module**: Defines dependencies and exports

#### 2. **Dependency Injection**
```typescript
@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private readonly aiService: AiService,  // Injected dependency
  ) {}
}
```

#### 3. **Guard Pattern**
```typescript
@UseGuards(AuthGuard)  // Applied to protected routes
@Controller('document')
export class DocumentController {
  // Protected endpoints
}
```

## 🎨 Frontend Architecture (React)

### Component Structure

```
frontend/src/
├── components/             # Reusable UI Components
│   ├── AiAnalysisModal.tsx    # AI results display
│   ├── ChatModal.tsx          # Chat interface
│   ├── DocumentUpload.tsx     # File upload component
│   ├── Footer.tsx             # Application footer
│   └── Navbar.tsx             # Navigation component
├── pages/                  # Main Application Pages
│   ├── Home.tsx               # Landing page
│   ├── Login.tsx              # Authentication
│   ├── Register.tsx           # User registration
│   ├── Documents.tsx          # Document management
│   └── Profile.tsx            # User profile
├── services/               # API Communication
│   └── api.ts                 # Axios-based API client
└── App.js                  # Main application component
```

### State Management Strategy

#### 1. **Local Component State**
- Used for UI-specific state (loading, form inputs)
- Managed with `useState` and `useEffect` hooks

#### 2. **Context for Authentication**
```typescript
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});
```

#### 3. **API State Management**
- Real-time polling for document processing status
- Optimistic updates for better UX

## 🗄️ Database Design (MongoDB)

### Schema Architecture

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  phoneNumber: String,
  createdAt: Date,
  updatedAt: Date
}

// Documents Collection
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to Users
  title: String,
  description: String,
  tags: [String],
  fileName: String,
  fileSize: Number,
  fileType: String,
  fileUrl: String,           // URL for file access
  filePath: String,          // Local file path
  uploadDate: Date,
  status: String,            // 'uploaded', 'processing', 'processed', 'error'
  
  // AI Analysis Results
  summary: String,
  insights: [String],
  keyPoints: [String],
  sentiment: String,
  processedAt: Date
}

// OTP Collection (Temporary)
{
  _id: ObjectId,
  phoneNumber: String,
  otp: String,
  expiresAt: Date,
  used: Boolean
}
```

### Indexing Strategy

```javascript
// Users
db.users.createIndex({ "phoneNumber": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })

// Documents
db.documents.createIndex({ "userId": 1 })
db.documents.createIndex({ "status": 1 })
db.documents.createIndex({ "uploadDate": -1 })

// OTP
db.otp.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
db.otp.createIndex({ "phoneNumber": 1 })
```

## 🤖 AI Integration Architecture

### Multi-Model Strategy

```
User Question
     │
     ▼
┌─────────────────┐
│ Question        │
│ Classification  │
└─────────────────┘
     │
     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Generative      │    │ Extractive      │    │ Comprehensive   │
│ Model           │    │ Q&A Model       │    │ Text Analysis   │
│ (flan-t5-base)  │    │ (roberta-squad) │    │ (Custom Logic)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │ Best Response   │
                   │ Selection       │
                   └─────────────────┘
```

### Content Processing Pipeline

```
PDF Upload
     │
     ▼
┌─────────────────┐
│ PDF Text        │
│ Extraction      │
│ (pdf-parse)     │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Content         │
│ Chunking        │
│ (Token Limits)  │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ AI Analysis     │
│ (Parallel)      │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Results         │
│ Aggregation     │
└─────────────────┘
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User Registration/Login
   └── Phone Number + OTP Verification
       └── JWT Token Generation
           └── Access Token (1h) + Refresh Token (7d)

2. API Request Authentication
   └── JWT Token Validation
       └── User Context Injection
           └── Route Protection
```

### Security Layers

#### 1. **Transport Security**
- HTTPS for all communications
- Secure headers and CORS configuration

#### 2. **Authentication Security**
- OTP-based verification (no passwords)
- JWT with short expiration times
- Refresh token rotation

#### 3. **Input Validation**
- Request body validation using class-validator
- File type and size restrictions
- Sanitization of user inputs

#### 4. **Authorization**
- Role-based access control
- Resource-level permissions (users can only access their own documents)

## 📊 Data Flow Architecture

### Document Upload Flow

```
Frontend Upload
     │
     ▼
Backend Validation
     │
     ▼
File Storage (Local)
     │
     ▼
Database Record Creation
     │
     ▼
Background AI Analysis
     │
     ▼
Results Storage
     │
     ▼
Frontend Polling/Updates
```

### Chat Interaction Flow

```
User Question
     │
     ▼
Session Validation
     │
     ▼
Document Content Retrieval
     │
     ▼
AI Model Processing
     │
     ▼
Response Generation
     │
     ▼
Chat History Update
     │
     ▼
Response Delivery
```

## 🚀 Performance Optimizations

### Backend Optimizations

1. **Async Processing**
   - AI analysis runs in background
   - Non-blocking file operations

2. **Content Chunking**
   - Large documents split for AI processing
   - Parallel processing of chunks

3. **Efficient Queries**
   - Database indexing strategy
   - Selective field projection

### Frontend Optimizations

1. **Code Splitting**
   - Lazy loading of components
   - Route-based splitting

2. **Caching Strategy**
   - API response caching
   - Static asset caching

3. **Optimistic Updates**
   - Immediate UI feedback
   - Background synchronization

## 🔄 Scalability Considerations

### Horizontal Scaling

1. **Stateless Services**
   - No server-side sessions
   - JWT-based authentication

2. **Database Scaling**
   - Read replicas for queries
   - Sharding strategy for large datasets

3. **File Storage**
   - Migration path to cloud storage (S3, GCS)
   - CDN integration for file delivery

### Vertical Scaling

1. **Resource Optimization**
   - Memory-efficient PDF processing
   - CPU optimization for AI calls

2. **Background Processing**
   - Queue-based job processing
   - Worker process scaling

## 🛠️ Development Architecture

### Build Pipeline

```
Source Code
     │
     ▼
TypeScript Compilation
     │
     ▼
Code Linting & Formatting
     │
     ▼
Unit Testing
     │
     ▼
Build Artifacts
     │
     ▼
Deployment Ready
```

### Environment Management

- **Development**: Local MongoDB, mock AI services
- **Testing**: In-memory database, test fixtures
- **Production**: Cloud database, production AI keys

## 📈 Monitoring & Observability

### Logging Strategy

1. **Structured Logging**
   - JSON formatted logs
   - Request/response correlation IDs

2. **Log Levels**
   - ERROR: System failures
   - WARN: Business logic issues
   - INFO: Important business events
   - DEBUG: Detailed execution flow

### Metrics Collection

1. **Performance Metrics**
   - API response times
   - Database query performance
   - AI model response times

2. **Business Metrics**
   - Document upload success rate
   - AI analysis completion rate
   - User engagement metrics

## 🔮 Future Architecture Enhancements

### Planned Improvements

1. **Microservices Migration**
   - Separate AI service
   - Independent scaling

2. **Real-time Features**
   - WebSocket integration
   - Live collaboration

3. **Advanced AI Pipeline**
   - Model fine-tuning
   - Custom AI models

4. **Enhanced Security**
   - OAuth integration
   - Advanced threat detection

---

This architecture provides a solid foundation for a scalable, secure, and maintainable document analysis platform while maintaining flexibility for future enhancements.
