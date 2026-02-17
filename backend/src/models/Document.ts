import mongoose, { Schema } from 'mongoose';
import { IDocument, DocumentStatus, StageStatus } from '../types';

const stageSchema = new Schema(
  {
    stageNumber: { type: Number, required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(StageStatus), default: StageStatus.PENDING },
    comment: { type: String, default: '' },
    actionAt: { type: Date },
  },
  { _id: false }
);

const auditTrailSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    fileLink: { type: String, required: true },
    status: { type: String, enum: Object.values(DocumentStatus), default: DocumentStatus.PENDING },
    submitterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stages: [stageSchema],
    currentStageNumber: { type: Number, default: 1 },
    auditTrail: [auditTrailSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

documentSchema.index({ status: 1, currentStageNumber: 1 });
documentSchema.index({ submitterId: 1 });
documentSchema.index({ 'stages.approverId': 1 });
documentSchema.index({ createdAt: -1 });

export const Document = mongoose.model<IDocument>('Document', documentSchema);
