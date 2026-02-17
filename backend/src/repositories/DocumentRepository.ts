import { Document } from "../models/Document";
import {
  IDocument,
  DocumentStatus,
  StageStatus,
  IStage,
  IAuditTrail,
} from "../types";
import { Types } from "mongoose";

export class DocumentRepository {
  async create(docData: {
    title: string;
    description: string;
    fileLink: string;
    submitterId: Types.ObjectId;
    stages: IStage[];
  }): Promise<IDocument> {
    const doc = new Document({
      ...docData,
      status: DocumentStatus.PENDING,
      currentStageNumber: 1,
      auditTrail: [],
    });
    return await doc.save();
  }

  async findById(id: Types.ObjectId): Promise<IDocument | null> {
    return await Document.findById(id)
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email");
  }

  async findByIdLean(id: Types.ObjectId): Promise<IDocument | null> {
    return await Document.findById(id).lean<IDocument | null>();
  }

  async findPaginated(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ documents: IDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate("submitterId", "name email")
        .populate("stages.approverId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IDocument[]>(),
      Document.countDocuments(filter),
    ]);
    return { documents, total };
  }

  async findPendingForApprover(
    approverId: Types.ObjectId,
  ): Promise<IDocument[]> {
    return await Document.find({
      status: { $in: [DocumentStatus.PENDING, DocumentStatus.IN_PROGRESS] },
      "stages.approverId": approverId,
      "stages.status": StageStatus.PENDING,
    })
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email")
      .lean<IDocument[]>();
  }

  async atomicApprove(
    docId: Types.ObjectId,
    stageNumber: number,
    approverId: Types.ObjectId,
    comment: string,
    auditEntry: IAuditTrail,
  ): Promise<IDocument | null> {
    return await Document.findOneAndUpdate(
      {
        _id: docId,
        currentStageNumber: stageNumber,
        status: { $in: [DocumentStatus.PENDING, DocumentStatus.IN_PROGRESS] },
        "stages.stageNumber": stageNumber,
        "stages.approverId": approverId,
        "stages.status": StageStatus.PENDING,
      },
      {
        $set: {
          "stages.$.status": StageStatus.APPROVED,
          "stages.$.comment": comment,
          "stages.$.actionAt": new Date(),
          status: DocumentStatus.IN_PROGRESS,
        },
        $inc: { currentStageNumber: 1 },
        $push: { auditTrail: auditEntry },
      },
      { new: true },
    )
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email");
  }

  async atomicReject(
    docId: Types.ObjectId,
    stageNumber: number,
    approverId: Types.ObjectId,
    comment: string,
    auditEntry: IAuditTrail,
  ): Promise<IDocument | null> {
    return await Document.findOneAndUpdate(
      {
        _id: docId,
        currentStageNumber: stageNumber,
        status: { $in: [DocumentStatus.PENDING, DocumentStatus.IN_PROGRESS] },
        "stages.stageNumber": stageNumber,
        "stages.approverId": approverId,
        "stages.status": StageStatus.PENDING,
      },
      {
        $set: {
          "stages.$.status": StageStatus.REJECTED,
          "stages.$.comment": comment,
          "stages.$.actionAt": new Date(),
          status: DocumentStatus.REJECTED,
          completedAt: new Date(),
        },
        $push: { auditTrail: auditEntry },
      },
      { new: true },
    )
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email");
  }

  async markAsCompleted(docId: Types.ObjectId): Promise<IDocument | null> {
    return await Document.findByIdAndUpdate(
      docId,
      {
        $set: {
          status: DocumentStatus.APPROVED,
          completedAt: new Date(),
        },
      },
      { new: true },
    )
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email");
  }

  async getDashboardStats(): Promise<{
    avgApprovalTime: number;
    statusDistribution: Array<{ _id: string; count: number }>;
  }> {
    const [avgResult, statusDistribution] = await Promise.all([
      Document.aggregate([
        {
          $match: {
            status: DocumentStatus.APPROVED,
            completedAt: { $exists: true },
          },
        },
        {
          $project: {
            approvalTime: { $subtract: ["$completedAt", "$createdAt"] },
          },
        },
        {
          $group: {
            _id: null,
            avgApprovalTime: { $avg: "$approvalTime" },
          },
        },
      ]),
      Document.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      avgApprovalTime: avgResult[0]?.avgApprovalTime || 0,
      statusDistribution,
    };
  }
}
