export enum UserRole {
  ADMIN = 'Admin',
  SUBMITTER = 'Submitter',
  APPROVER = 'Approver',
}

export enum DocumentStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum StageStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Stage {
  stageNumber: number;
  approverId: {
    _id: string;
    name: string;
    email: string;
  };
  status: StageStatus;
  comment: string;
  actionAt?: string;
}

export interface AuditTrail {
  actorId: {
    _id: string;
    name: string;
  };
  action: string;
  timestamp: string;
  details: string;
}

export interface Document {
  _id: string;
  title: string;
  description: string;
  fileLink: string;
  status: DocumentStatus;
  submitterId: {
    _id: string;
    name: string;
    email: string;
  };
  stages: Stage[];
  currentStageNumber: number;
  auditTrail: AuditTrail[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  avgApprovalTimeMs: number;
  avgApprovalTimeHours: number;
  statusDistribution: Array<{ status: string; count: number }>;
}
