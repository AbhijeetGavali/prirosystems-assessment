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
      .populate("stages.approverId", "name email")
      .populate("auditTrail.actorId", "name email");
  }

  async findByIdLean(id: Types.ObjectId): Promise<IDocument | null> {
    return await Document.findById(id).lean<IDocument | null>();
  }

  async findPaginated(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    userId?: Types.ObjectId,
    userRole?: string,
  ): Promise<{ documents: IDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Role-based filtering
    const query: any = { ...filter };
    if (userRole === 'Submitter') {
      query.submitterId = userId;
    } else if (userRole === 'Approver') {
      query['stages.approverId'] = userId;
    }
    // Admin can see all documents (no additional filter)
    
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate("submitterId", "name email")
        .populate("stages.approverId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IDocument[]>(),
      Document.countDocuments(query),
    ]);
    return { documents, total };
  }

  async findPendingForApprover(
    approverId: Types.ObjectId,
  ): Promise<IDocument[]> {
    return await Document.find({
      status: { $in: [DocumentStatus.PENDING, DocumentStatus.IN_PROGRESS] },
      $expr: {
        $eq: [
          { $arrayElemAt: ["$stages.approverId", { $subtract: ["$currentStageNumber", 1] }] },
          approverId,
        ],
      },
    })
      .populate("submitterId", "name email")
      .populate("stages.approverId", "name email")
      .populate("auditTrail.actorId", "name email")
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
      .populate("stages.approverId", "name email")
      .populate("auditTrail.actorId", "name email");
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
      .populate("stages.approverId", "name email")
      .populate("auditTrail.actorId", "name email");
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
      .populate("stages.approverId", "name email")
      .populate("auditTrail.actorId", "name email");
  }

  async getDashboardStats(
    userId?: Types.ObjectId,
    userRole?: string,
  ): Promise<{
    totalDocuments: number;
    approvedCount: number;
    rejectedCount: number;
    avgApprovalTime: number;
    statusDistribution: Array<{ _id: string; count: number }>;
  }> {
    // Role-based filter
    const roleFilter: any = {};
    if (userRole === 'Submitter') {
      roleFilter.submitterId = userId;
    } else if (userRole === 'Approver') {
      roleFilter['stages.approverId'] = userId;
    }
    
    const [totalCount, approvedCount, rejectedCount, avgResult, statusDistribution] = await Promise.all([
      Document.countDocuments(roleFilter),
      Document.countDocuments({ ...roleFilter, status: DocumentStatus.APPROVED }),
      Document.countDocuments({ ...roleFilter, status: DocumentStatus.REJECTED }),
      Document.aggregate([
        {
          $match: {
            ...roleFilter,
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
        { $match: roleFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      totalDocuments: totalCount,
      approvedCount,
      rejectedCount,
      avgApprovalTime: avgResult[0]?.avgApprovalTime || 0,
      statusDistribution,
    };
  }
}
