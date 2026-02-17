import { DocumentRepository } from '../repositories/DocumentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IDocument, DocumentStatus, StageStatus, UserRole } from '../types';
import { Types } from 'mongoose';

export class DocumentService {
  private docRepo = new DocumentRepository();
  private userRepo = new UserRepository();

  async createDocument(data: {
    title: string;
    description: string;
    fileLink: string;
    submitterId: Types.ObjectId;
    approverIds: string[];
  }): Promise<IDocument> {
    // Validate approvers exist and have correct role
    const approvers = await Promise.all(
      data.approverIds.map(async (id) => {
        const approver = await this.userRepo.findById(new Types.ObjectId(id));
        if (!approver || approver.role !== UserRole.APPROVER) {
          throw new Error(`Invalid approver ID: ${id}`);
        }
        return approver;
      })
    );

    const stages = approvers.map((approver, index) => ({
      stageNumber: index + 1,
      approverId: approver._id,
      status: StageStatus.PENDING,
      comment: '',
    }));

    const document = await this.docRepo.create({
      title: data.title,
      description: data.description,
      fileLink: data.fileLink,
      submitterId: data.submitterId,
      stages,
    });

    // Add audit trail entry
    document.auditTrail.push({
      actorId: data.submitterId,
      action: 'DOCUMENT_CREATED',
      timestamp: new Date(),
      details: `Document "${data.title}" created`,
    });
    await document.save();

    return await this.docRepo.findById(document._id) as IDocument;
  }

  async getDocuments(
    filter: { status?: DocumentStatus },
    page: number,
    limit: number
  ): Promise<{ documents: IDocument[]; total: number; page: number; totalPages: number }> {
    const { documents, total } = await this.docRepo.findPaginated(filter, page, limit);
    return {
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocumentById(id: Types.ObjectId): Promise<IDocument> {
    const document = await this.docRepo.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  async getPendingDocumentsForApprover(approverId: Types.ObjectId): Promise<IDocument[]> {
    return await this.docRepo.findPendingForApprover(approverId);
  }

  async approveDocument(
    docId: Types.ObjectId,
    approverId: Types.ObjectId,
    comment: string
  ): Promise<IDocument> {
    const doc = await this.docRepo.findByIdLean(docId);
    if (!doc) {
      throw new Error('Document not found');
    }

    const currentStage = doc.stages.find((s) => s.stageNumber === doc.currentStageNumber);
    if (!currentStage) {
      throw new Error('Invalid stage');
    }

    if (!currentStage.approverId.equals(approverId)) {
      throw new Error('You are not the approver for this stage');
    }

    if (currentStage.status !== StageStatus.PENDING) {
      throw new Error('Stage already processed');
    }

    const auditEntry = {
      actorId: approverId,
      action: 'STAGE_APPROVED',
      timestamp: new Date(),
      details: `Stage ${doc.currentStageNumber} approved. Comment: ${comment}`,
    };

    const updatedDoc = await this.docRepo.atomicApprove(
      docId,
      doc.currentStageNumber,
      approverId,
      comment,
      auditEntry
    );

    if (!updatedDoc) {
      throw new Error('Failed to approve document - concurrent modification detected');
    }

    // Check if all stages are completed
    if (updatedDoc.currentStageNumber > updatedDoc.stages.length) {
      return (await this.docRepo.markAsCompleted(docId)) as IDocument;
    }

    return updatedDoc;
  }

  async rejectDocument(
    docId: Types.ObjectId,
    approverId: Types.ObjectId,
    comment: string
  ): Promise<IDocument> {
    const doc = await this.docRepo.findByIdLean(docId);
    if (!doc) {
      throw new Error('Document not found');
    }

    const currentStage = doc.stages.find((s) => s.stageNumber === doc.currentStageNumber);
    if (!currentStage) {
      throw new Error('Invalid stage');
    }

    if (!currentStage.approverId.equals(approverId)) {
      throw new Error('You are not the approver for this stage');
    }

    if (currentStage.status !== StageStatus.PENDING) {
      throw new Error('Stage already processed');
    }

    const auditEntry = {
      actorId: approverId,
      action: 'STAGE_REJECTED',
      timestamp: new Date(),
      details: `Stage ${doc.currentStageNumber} rejected. Comment: ${comment}`,
    };

    const updatedDoc = await this.docRepo.atomicReject(
      docId,
      doc.currentStageNumber,
      approverId,
      comment,
      auditEntry
    );

    if (!updatedDoc) {
      throw new Error('Failed to reject document - concurrent modification detected');
    }

    return updatedDoc;
  }

  async getDashboardStats(): Promise<{
    avgApprovalTimeMs: number;
    avgApprovalTimeHours: number;
    statusDistribution: Array<{ status: string; count: number }>;
  }> {
    const stats = await this.docRepo.getDashboardStats();
    return {
      avgApprovalTimeMs: stats.avgApprovalTime,
      avgApprovalTimeHours: stats.avgApprovalTime / (1000 * 60 * 60),
      statusDistribution: stats.statusDistribution.map((s) => ({
        status: s._id,
        count: s.count,
      })),
    };
  }
}
