import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useGetPendingDocumentsQuery } from '../store/api/documentApi';
import { DocumentStatus } from '../types';

export const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetPendingDocumentsQuery();

  const documents = data?.data || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Pending Approvals
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Submitter</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Current Stage</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No pending approvals</TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.submitterId.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      color={doc.status === DocumentStatus.IN_PROGRESS ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    Stage {Math.min(doc.currentStageNumber, doc.stages.length)} of {doc.stages.length}
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/documents/${doc._id}`)}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
