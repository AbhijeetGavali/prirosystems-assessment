import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Card,
  CardContent,
  Stack,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Link as LinkIcon,
  Person,
  CalendarToday,
  Timeline,
} from '@mui/icons-material';
import {
  useGetDocumentByIdQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
} from '../store/api/documentApi';
import { useAppSelector } from '../hooks/redux';
import { DocumentStepper } from '../components/DocumentStepper';
import { toast } from 'react-toastify';
import { DocumentStatus, UserRole } from '../types';
import { getErrorMessage } from '../utils/errorHandler';

export const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetDocumentByIdQuery(id!);
  const [approveDocument, { isLoading: approving }] = useApproveDocumentMutation();
  const [rejectDocument, { isLoading: rejecting }] = useRejectDocumentMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const document = data?.data;

  const handleAction = async () => {
    try {
      if (dialogType === 'approve') {
        await approveDocument({ id: id!, comment }).unwrap();
        toast.success('Document approved successfully!');
      } else {
        await rejectDocument({ id: id!, comment }).unwrap();
        toast.success('Document rejected successfully!');
      }
      setOpenDialog(false);
      setComment('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const canApprove = () => {
    if (!document || !user || user.role !== UserRole.APPROVER) return false;
    if (document.status !== DocumentStatus.PENDING && document.status !== DocumentStatus.IN_PROGRESS) return false;

    const currentStage = document.stages.find((s) => s.stageNumber === document.currentStageNumber);
    if (!currentStage) return false;
    
    return currentStage.approverId._id === user.id && currentStage.status === 'Pending';
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED: return 'success';
      case DocumentStatus.REJECTED: return 'error';
      case DocumentStatus.IN_PROGRESS: return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box>
        <Alert severity="error">Document not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/documents')}
        sx={{ mb: 3 }}
      >
        Back to Documents
      </Button>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {document.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {document.description}
                </Typography>
              </Box>
              <Chip label={document.status} color={getStatusColor(document.status)} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Submitter</Typography>
                    <Typography variant="body2">{document.submitterId.name}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="body2">{new Date(document.createdAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">File Link</Typography>
                    <Typography variant="body2">
                      <a href={document.fileLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                        {document.fileLink}
                      </a>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline fontSize="small" />
              Approval Progress
            </Typography>
            <DocumentStepper stages={document.stages} currentStageNumber={document.currentStageNumber} />

            {canApprove() && (
              <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Action Required
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This document is awaiting your approval
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setDialogType('approve');
                      setOpenDialog(true);
                    }}
                    disabled={approving || rejecting}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setDialogType('reject');
                      setOpenDialog(true);
                    }}
                    disabled={approving || rejecting}
                  >
                    Reject
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Audit Trail Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Audit Trail
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {document.auditTrail.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No activity yet</Typography>
              ) : (
                document.auditTrail.map((entry, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {entry.action.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {typeof entry.actorId === 'object' && entry.actorId?.name
                          ? `${entry.actorId.name} (${entry.actorId.email})`
                          : 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {entry.details}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Approve/Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'approve' ? 'Approve Document' : 'Reject Document'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={4}
            margin="normal"
            placeholder="Add your comments here..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={approving || rejecting}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={dialogType === 'approve' ? 'success' : 'error'}
            disabled={approving || rejecting}
          >
            {approving || rejecting ? 'Processing...' : dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
