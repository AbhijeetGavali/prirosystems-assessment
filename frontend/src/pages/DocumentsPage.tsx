import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  CircularProgress,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useGetDocumentsQuery } from '../store/api/documentApi';
import { useAppSelector } from '../hooks/redux';
import { UserRole, DocumentStatus } from '../types';
import { Navbar } from '../components/Navbar';

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DocumentStatus | ''>('');

  const { data, isLoading } = useGetDocumentsQuery({
    page,
    limit: 10,
    status: status || undefined,
  });

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const documents = data?.data?.documents || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Documents</Typography>
          {(user?.role === UserRole.SUBMITTER || user?.role === UserRole.ADMIN) && (
            <Button variant="contained" onClick={() => navigate('/documents/create')}>
              Create Document
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={status}
              label="Filter by Status"
              onChange={(e) => {
                setStatus(e.target.value as DocumentStatus | '');
                setPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={DocumentStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={DocumentStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={DocumentStatus.APPROVED}>Approved</MenuItem>
              <MenuItem value={DocumentStatus.REJECTED}>Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Submitter</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Stage</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.submitterId.name}</TableCell>
                  <TableCell>
                    <Chip label={doc.status} color={getStatusColor(doc.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {doc.status === DocumentStatus.APPROVED || doc.status === DocumentStatus.REJECTED
                      ? `${doc.stages.length} / ${doc.stages.length}`
                      : `${Math.min(doc.currentStageNumber, doc.stages.length)} / ${doc.stages.length}`}
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/documents/${doc._id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      </Container>
    </>
  );
};
