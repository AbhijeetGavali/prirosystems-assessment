import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  useGetDocumentByIdQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
} from '../store/api/documentApi';
import { useAppSelector } from '../hooks/redux';
import { DocumentStepper } from '../components/DocumentStepper';
import { toast } from 'react-toastify';
import { Navbar } from '../components/Navbar';
import { DocumentStatus, UserRole } from '../types';

export const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetDocumentByIdQuery(id!);
  const [approveDocument] = useApproveDocumentMutation();
  const [rejectDocument] = useRejectDocumentMutation();

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
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || 'Action failed');
    }
  };

  const canApprove = () => {
    if (!document || !user || user.role !== UserRole.APPROVER) return false;
    if (document.status !== DocumentStatus.PENDING && document.status !== DocumentStatus.IN_PROGRESS) return false;

    const currentStage = document.stages.find((s) => s.stageNumber === document.currentStageNumber);
    return currentStage?.approverId._id === user.id;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <>
        <Navbar />
        <Container>
          <Typography variant="h5" sx={{ mt: 4 }}>
            Document not found
          </Typography>
        </Container>
      </>
    );
  }

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return 'success';
      case DocumentStatus.REJECTED:
        return 'error';
      case DocumentStatus.IN_PROGRESS:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/documents')} sx={{ mb: 2 }}>
          Back to Documents
        </Button>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">{document.title}</Typography>
            <Chip label={document.status} color={getStatusColor(document.status)} />
          </Box>

          <Typography variant="body1" paragraph>
            <strong>Description:</strong> {document.description}
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>File Link:</strong>{' '}
            <Link href={document.fileLink} target="_blank" rel="noopener">
              {document.fileLink}
            </Link>
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Submitter:</strong> {document.submitterId.name} ({document.submitterId.email})
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Created:</strong> {new Date(document.createdAt).toLocaleString()}
          </Typography>

          {document.completedAt && (
            <Typography variant="body1" paragraph>
              <strong>Completed:</strong> {new Date(document.completedAt).toLocaleString()}
            </Typography>
          )}

          <DocumentStepper stages={document.stages} currentStageNumber={document.currentStageNumber} />

          {canApprove() && (
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setDialogType('approve');
                  setOpenDialog(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setDialogType('reject');
                  setOpenDialog(true);
                }}
              >
                Reject
              </Button>
            </Box>
          )}

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Audit Trail
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Actor</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {document.auditTrail.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.actorId.name}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.details}</TableCell>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogType === 'approve' ? 'Approve Document' : 'Reject Document'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAction} variant="contained" color={dialogType === 'approve' ? 'success' : 'error'}>
            {dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
