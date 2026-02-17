# Workflow Approval & Document Processing System

A production-ready, enterprise-grade workflow approval system built with TypeScript across the entire stack.

## 🏗 Architecture

### Tech Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend:** React (Vite), TypeScript, Redux Toolkit (RTK Query), Material UI, Tailwind CSS
- **Security:** JWT (Access + Refresh tokens), Bcrypt, Zod validation, Helmet, Rate Limiting
- **DevOps:** Docker, Docker Compose (Multi-stage builds)

### Design Pattern

Clean Architecture with Routes-Controller-Service-Repository pattern:

```
Routes → Controllers → Services → Repositories → Models
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Using Docker (Recommended)

1. **Clone and navigate to the project:**

```bash
cd ASSESSMENT
```

2. **Start all services:**

```bash
docker-compose up --build
```

3. **Seed the database:**

```bash
docker exec -it workflow_backend npm run seed
```

4. **Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- API Documentation: http://localhost:8080/api-docs
- MongoDB: mongodb://localhost:27017

### Local Development

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
npm run seed  # Seed initial users
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 👥 Test Credentials

After running the seed script:

| Role      | Email                  | Password   |
| --------- | ---------------------- | ---------- |
| Admin     | admin@example.com      | admin123   |
| Submitter | submitter1@example.com | submit123  |
| Submitter | submitter2@example.com | submit123  |
| Approver  | approver1@example.com  | approve123 |
| Approver  | approver2@example.com  | approve123 |
| Approver  | approver3@example.com  | approve123 |

## 📚 API Documentation

Interactive API documentation available at: **http://localhost:8080/api-docs**

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Submitter"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Document Endpoints

#### Create Document

```http
POST /api/documents
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Project Proposal",
  "description": "Q1 2024 Project Proposal",
  "fileLink": "https://example.com/file.pdf",
  "approverIds": ["approver1_id", "approver2_id"]
}
```

#### Get All Documents (Paginated)

```http
GET /api/documents?page=1&limit=10&status=Pending
Authorization: Bearer {access_token}
```

#### Get Document by ID

```http
GET /api/documents/{id}
Authorization: Bearer {access_token}
```

#### Get Pending Documents (Approver)

```http
GET /api/documents/pending
Authorization: Bearer {access_token}
```

#### Approve Document

```http
POST /api/documents/{id}/approve
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "comment": "Approved with minor suggestions"
}
```

#### Reject Document

```http
POST /api/documents/{id}/reject
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "comment": "Needs more details"
}
```

#### Get Dashboard Stats

```http
GET /api/documents/dashboard
Authorization: Bearer {access_token}
```

### User Endpoints

#### Get All Approvers

```http
GET /api/users/approvers
Authorization: Bearer {access_token}
```

#### Get All Users (Admin only)

```http
GET /api/users
Authorization: Bearer {access_token}
```

## 🔐 Security Features

1. **JWT Authentication:** Access tokens (15min) + Refresh tokens (7 days)
2. **Password Hashing:** Bcrypt with salt rounds
3. **Input Validation:** Zod schemas for all API inputs with enhanced validation:
   - URL validation for file links
   - Duplicate approver detection
   - Maximum 10 approvers per document
4. **Rate Limiting:** 100 requests per 15 minutes per IP
5. **Helmet:** Security headers
6. **CORS:** Configured for frontend origin
7. **Role-Based Access Control:** Protected routes with RoleGuard
8. **Atomic Operations:** MongoDB atomic operators prevent race conditions
9. **Connection Pooling:** Optimized database connections (10 max, 2 min)
10. **Structured Logging:** Winston logger for production monitoring

## 🎯 Core Features

### Multi-Stage Approval Workflow

- Documents progress through sequential approval stages
- Each stage requires approval from a designated approver
- Atomic operations prevent concurrent modification issues
- Rejection at any stage halts the workflow

### Concurrency Control

Uses MongoDB atomic operators with filter criteria:

```typescript
// Example: Atomic approval operation
await Document.findOneAndUpdate(
  {
    _id: docId,
    currentStageNumber: stageNumber,
    status: { $in: ["Pending", "InProgress"] },
    "stages.stageNumber": stageNumber,
    "stages.approverId": approverId,
    "stages.status": "Pending",
  },
  {
    $set: { "stages.$.status": "Approved" },
    $inc: { currentStageNumber: 1 },
    $push: { auditTrail: auditEntry },
  },
);
```

### Audit Trail

Every action is logged with:

- Actor ID
- Action type
- Timestamp
- Details

### Dashboard Analytics

- Total documents count
- Pending approvals per user (role-aware)
- Approved vs Rejected count
- Average approval time (hours)
- Status distribution (pie chart)

## 📁 Project Structure

```
ASSESSMENT/
├── backend/
│   ├── src/
│   │   ├── __tests__/       # Test files
│   │   │   ├── integration/ # API endpoint tests
│   │   │   └── unit/        # Service & logic tests
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Mongoose models
│   │   ├── types/           # TypeScript interfaces
│   │   ├── repositories/    # Data access layer
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── validators/      # Zod schemas
│   │   ├── scripts/         # Utility scripts
│   │   └── server.ts        # Entry point
│   ├── Dockerfile
│   ├── jest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleGuard.tsx
│   │   │   └── DocumentStepper.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── DocumentDetailPage.tsx
│   │   │   ├── PendingApprovalsPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   ├── store/           # Redux store
│   │   │   ├── api/         # RTK Query APIs
│   │   │   └── slices/      # Redux slices
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── README.md
├── TEST_GUIDE.md
└── OPTIMIZATION_GUIDE.md
```

## 🔄 Workflow States

### Document Status

- **Pending:** Initial state, no approvals yet
- **InProgress:** At least one stage approved
- **Approved:** All stages approved
- **Rejected:** Rejected at any stage

### Stage Status

- **Pending:** Awaiting approval
- **Approved:** Stage approved
- **Rejected:** Stage rejected

## 🎨 Frontend Features

### Authentication

- Persistent login using localStorage
- Axios interceptors for automatic token refresh
- 401 handling with redirect to login
- Role-based route protection with automatic redirection

### Document Management

- Create documents with multiple approvers
- View all documents with pagination and filtering
- Visual progress tracking with MUI Stepper
- Approve/Reject with comments
- Real-time status updates

### Dashboard

- 5 key metrics for all user roles:
  - Total documents
  - Pending approvals (role-aware)
  - Approved count
  - Rejected count
  - Average approval time
- Status distribution pie chart
- Role-specific data filtering

### UI Components

- Material UI for consistent design
- Tailwind CSS for utility styling
- React-Toastify for notifications
- Recharts for data visualization
- Responsive design (mobile-friendly)

## 🧪 Testing the System

1. **Login as Submitter:**
   - Create a new document
   - Select multiple approvers in order
   - Submit the document

2. **Login as First Approver:**
   - View pending documents
   - Open the document
   - See the stepper showing current stage
   - Approve with a comment

3. **Login as Second Approver:**
   - View the same document
   - Notice the stepper updated
   - Approve or reject

4. **View Dashboard:**
   - Check approval time statistics
   - View status distribution
   - See pending tasks (if approver)

## 🛠 Development

### Backend Scripts

```bash
npm run dev           # Start development server
npm run build         # Build TypeScript
npm start             # Start production server
npm run seed          # Seed database
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Test Coverage

```
Test Suites: 7 passed, 7 total
Tests:       36 passed, 36 total
Coverage:    56% overall
```

**Key Coverage:**
- AuthService: 95%
- Middlewares: 92%
- Models: 83%
- DocumentService: 50%


### Frontend Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Execute command in container
docker exec -it workflow_backend npm run seed
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=8080
MONGODB_URI=mongodb://mongo:27017/workflow_db
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=production
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080/api
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker-compose restart mongo
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml
# Or kill process using the port
lsof -ti:8080 | xargs kill -9
```

### Clear Docker Cache

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## ⚡ Performance Optimizations

### Database
- ✅ Connection pooling (10 max, 2 min connections)
- ✅ 4 strategic indexes on Document model
- ✅ `.lean()` queries for read-only operations
- ✅ Batch user validation (N queries → 1 query)

### Backend
- ✅ Atomic operations for concurrency control
- ✅ `Promise.all()` for parallel operations
- ✅ Field selection with `.select()` to reduce payload

### Frontend
- ✅ RTK Query caching
- ✅ Responsive design with Material-UI Grid
- ✅ Optimistic UI updates


## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using TypeScript, React, and Node.js
