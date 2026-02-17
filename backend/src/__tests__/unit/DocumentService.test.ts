import { DocumentService } from '../../services/DocumentService';
import { DocumentRepository } from '../../repositories/DocumentRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { Types } from 'mongoose';
import { UserRole, DocumentStatus, StageStatus } from '../../types';

jest.mock('../../repositories/DocumentRepository');
jest.mock('../../repositories/UserRepository');

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockDocRepo: jest.Mocked<DocumentRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    documentService = new DocumentService();
    mockDocRepo = (documentService as any).docRepo;
    mockUserRepo = (documentService as any).userRepo;
  });

  describe('createDocument', () => {
    it('should create document with valid approvers', async () => {
      const mockApprover = {
        _id: new Types.ObjectId(),
        role: UserRole.APPROVER,
        name: 'Approver 1',
        email: 'approver1@example.com',
      };

      const mockDocument = {
        _id: new Types.ObjectId(),
        title: 'Test Doc',
        description: 'Test Description',
        fileLink: 'https://example.com/file.pdf',
        submitterId: new Types.ObjectId(),
        stages: [{ stageNumber: 1, approverId: mockApprover._id, status: StageStatus.PENDING, comment: '' }],
        status: DocumentStatus.PENDING,
        auditTrail: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockUserRepo.findByIds.mockResolvedValue([mockApprover] as any);
      mockDocRepo.create.mockResolvedValue(mockDocument as any);
      mockDocRepo.findById.mockResolvedValue(mockDocument as any);

      const result = await documentService.createDocument({
        title: 'Test Doc',
        description: 'Test Description',
        fileLink: 'https://example.com/file.pdf',
        submitterId: new Types.ObjectId(),
        approverIds: [mockApprover._id.toString()],
      });

      expect(result).toBeDefined();
      expect(mockDocRepo.create).toHaveBeenCalled();
    });

    it('should throw error for invalid approver', async () => {
      const validObjectId = new Types.ObjectId().toString();
      mockUserRepo.findByIds.mockResolvedValue([]);

      await expect(
        documentService.createDocument({
          title: 'Test Doc',
          description: 'Test Description',
          fileLink: 'https://example.com/file.pdf',
          submitterId: new Types.ObjectId(),
          approverIds: [validObjectId],
        })
      ).rejects.toThrow('One or more invalid approver IDs');
    });
  });

  describe('approveDocument', () => {
    it('should approve document at current stage', async () => {
      const approverId = new Types.ObjectId();
      const docId = new Types.ObjectId();
      
      const mockDoc = {
        _id: docId,
        currentStageNumber: 1,
        stages: [
          { stageNumber: 1, approverId, status: StageStatus.PENDING, comment: '' },
        ],
        status: DocumentStatus.PENDING,
      };

      const updatedDoc = { ...mockDoc, status: DocumentStatus.IN_PROGRESS };

      mockDocRepo.findByIdLean.mockResolvedValue(mockDoc as any);
      mockDocRepo.atomicApprove.mockResolvedValue(updatedDoc as any);

      const result = await documentService.approveDocument(docId, approverId, 'Looks good');

      expect(result).toBeDefined();
      expect(mockDocRepo.atomicApprove).toHaveBeenCalled();
    });

    it('should throw error if not the assigned approver', async () => {
      const approverId = new Types.ObjectId();
      const wrongApproverId = new Types.ObjectId();
      const docId = new Types.ObjectId();
      
      const mockDoc = {
        _id: docId,
        currentStageNumber: 1,
        stages: [
          { stageNumber: 1, approverId, status: StageStatus.PENDING, comment: '' },
        ],
        status: DocumentStatus.PENDING,
      };

      mockDocRepo.findByIdLean.mockResolvedValue(mockDoc as any);

      await expect(
        documentService.approveDocument(docId, wrongApproverId, 'Looks good')
      ).rejects.toThrow('You are not the approver for this stage');
    });
  });
});
