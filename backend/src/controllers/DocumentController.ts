import { Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { AuthRequest } from '../middlewares/auth';
import { Types } from 'mongoose';
import { DocumentStatus } from '../types';

export class DocumentController {
  private docService = new DocumentService();

  createDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, fileLink, approverIds } = req.body;
      const document = await this.docService.createDocument({
        title,
        description,
        fileLink,
        submitterId: req.user!.userId,
        approverIds,
      });
      res.status(201).json({
        success: true,
        data: document,
        message: 'Document created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Document creation failed',
        errorCode: 'DOCUMENT_CREATION_FAILED',
      });
    }
  };

  getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as DocumentStatus | undefined;

      const filter: { status?: DocumentStatus } = {};
      if (status) filter.status = status;

      const result = await this.docService.getDocuments(filter, page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch documents',
        errorCode: 'FETCH_DOCUMENTS_FAILED',
      });
    }
  };

  getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const document = await this.docService.getDocumentById(new Types.ObjectId(id));
      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Document not found',
        errorCode: 'DOCUMENT_NOT_FOUND',
      });
    }
  };

  getPendingDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const documents = await this.docService.getPendingDocumentsForApprover(req.user!.userId);
      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch pending documents',
        errorCode: 'FETCH_PENDING_FAILED',
      });
    }
  };

  approveDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const document = await this.docService.approveDocument(
        new Types.ObjectId(id),
        req.user!.userId,
        comment || ''
      );
      res.status(200).json({
        success: true,
        data: document,
        message: 'Document approved successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Approval failed',
        errorCode: 'APPROVAL_FAILED',
      });
    }
  };

  rejectDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const document = await this.docService.rejectDocument(
        new Types.ObjectId(id),
        req.user!.userId,
        comment || ''
      );
      res.status(200).json({
        success: true,
        data: document,
        message: 'Document rejected successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Rejection failed',
        errorCode: 'REJECTION_FAILED',
      });
    }
  };

  getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.docService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        errorCode: 'DASHBOARD_FETCH_FAILED',
      });
    }
  };
}
