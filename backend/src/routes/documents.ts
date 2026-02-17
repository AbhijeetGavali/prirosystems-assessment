import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createDocumentSchema, approveRejectSchema, paginationSchema } from '../validators';
import { UserRole } from '../types';

const router = Router();
const docController = new DocumentController();

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUBMITTER, UserRole.ADMIN),
  validate(createDocumentSchema),
  docController.createDocument
);

router.get('/', authenticate, validate(paginationSchema), docController.getDocuments);

router.get('/pending', authenticate, authorize(UserRole.APPROVER), docController.getPendingDocuments);

router.get('/dashboard', authenticate, docController.getDashboard);

router.get('/:id', authenticate, docController.getDocumentById);

router.post(
  '/:id/approve',
  authenticate,
  authorize(UserRole.APPROVER),
  validate(approveRejectSchema),
  docController.approveDocument
);

router.post(
  '/:id/reject',
  authenticate,
  authorize(UserRole.APPROVER),
  validate(approveRejectSchema),
  docController.rejectDocument
);

export default router;
