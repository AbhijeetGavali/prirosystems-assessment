import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createDocumentSchema, approveRejectSchema, paginationSchema } from '../validators';
import { UserRole } from '../types';

const router = Router();
const docController = new DocumentController();

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, fileLink, approverIds]
 *             properties:
 *               title: { type: string, example: "Project Proposal" }
 *               description: { type: string, example: "Q1 2024 Project Proposal" }
 *               fileLink: { type: string, example: "https://example.com/file.pdf" }
 *               approverIds: { type: array, items: { type: string }, example: ["approver1_id", "approver2_id"] }
 *     responses:
 *       201: { description: Document created }
 *       400: { description: Validation error }
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUBMITTER, UserRole.ADMIN),
  validate(createDocumentSchema),
  docController.createDocument
);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents (paginated)
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, InProgress, Approved, Rejected] }
 *     responses:
 *       200: { description: Documents retrieved }
 */
router.get('/', authenticate, validate(paginationSchema), docController.getDocuments);

/**
 * @swagger
 * /documents/pending:
 *   get:
 *     summary: Get pending documents for approver
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pending documents retrieved }
 */
router.get('/pending', authenticate, authorize(UserRole.APPROVER), docController.getPendingDocuments);

/**
 * @swagger
 * /documents/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard stats retrieved }
 */
router.get('/dashboard', authenticate, docController.getDashboard);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Document retrieved }
 *       404: { description: Document not found }
 */
router.get('/:id', authenticate, docController.getDocumentById);

/**
 * @swagger
 * /documents/{id}/approve:
 *   post:
 *     summary: Approve document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: { type: string, example: "Approved with minor suggestions" }
 *     responses:
 *       200: { description: Document approved }
 *       400: { description: Approval failed }
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(UserRole.APPROVER),
  validate(approveRejectSchema),
  docController.approveDocument
);

/**
 * @swagger
 * /documents/{id}/reject:
 *   post:
 *     summary: Reject document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: { type: string, example: "Needs more details" }
 *     responses:
 *       200: { description: Document rejected }
 *       400: { description: Rejection failed }
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(UserRole.APPROVER),
  validate(approveRejectSchema),
  docController.rejectDocument
);

export default router;
