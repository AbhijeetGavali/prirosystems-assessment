import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'Admin',
  SUBMITTER = 'Submitter',
  APPROVER = 'Approver',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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

export interface IStage {
  stageNumber: number;
  approverId: Types.ObjectId;
  status: StageStatus;
  comment: string;
  actionAt?: Date;
}

export interface IAuditTrail {
  actorId: Types.ObjectId;
  action: string;
  timestamp: Date;
  details: string;
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  fileLink: string;
  status: DocumentStatus;
  submitterId: Types.ObjectId;
  stages: IStage[];
  currentStageNumber: number;
  auditTrail: IAuditTrail[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
