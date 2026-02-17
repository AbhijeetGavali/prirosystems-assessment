import { useState } from 'react';
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
  Button,
  Chip,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  TextField,
  IconButton,
  Autocomplete,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useGetDocumentsQuery, useCreateDocumentMutation } from '../store/api/documentApi';
import { useGetApproversQuery } from '../store/api/userApi';
import { useAppSelector } from '../hooks/redux';
import { UserRole, DocumentStatus } from '../types';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorHandler';

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { data, isLoading } = useGetDocumentsQuery({ page, limit: 10, status: status || undefined });
  const { data: approversData } = useGetApproversQuery();
  const [createDocument, { isLoading: creating }] = useCreateDocumentMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileLink: '',
    approverIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.approverIds.length === 0) {
      toast.error('Please select at least one approver');
      return;
    }
    
    try {
      await createDocument(formData).unwrap();
      toast.success('Document created successfully!');
      setDrawerOpen(false);
      setFormData({ title: '', description: '', fileLink: '', approverIds: [] });
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED: return 'success';
      case DocumentStatus.REJECTED: return 'error';
      case DocumentStatus.IN_PROGRESS: return 'warning';
      default: return 'default';
    }
  };

  const documents = data?.data?.documents || [];
  const totalPages = data?.data?.totalPages || 1;
  const approvers = approversData?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Documents</Typography>
        {(user?.role === UserRole.SUBMITTER || user?.role === UserRole.ADMIN) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}>
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
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Submitter</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Stage</strong></TableCell>
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
                <TableCell colSpan={6} align="center">No documents found</TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.submitterId.name}</TableCell>
                  <TableCell>
                    <Chip label={doc.status} color={getStatusColor(doc.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {doc.status === DocumentStatus.APPROVED || doc.status === DocumentStatus.REJECTED
                      ? `${doc.stages.length}/${doc.stages.length}`
                      : `${Math.min(doc.currentStageNumber, doc.stages.length)}/${doc.stages.length}`}
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

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>Create Document</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="File Link"
                type="url"
                value={formData.fileLink}
                onChange={(e) => setFormData({ ...formData, fileLink: e.target.value })}
                required
              />
              <Autocomplete
                multiple
                options={approvers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={approvers.filter((a) => formData.approverIds.includes(a.id))}
                onChange={(_, newValue) => setFormData({ ...formData, approverIds: newValue.map((v) => v.id) })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Approvers (in order)"
                    required={formData.approverIds.length === 0}
                    error={formData.approverIds.length === 0}
                  />
                )}
              />
              <Button type="submit" variant="contained" size="large" disabled={creating} fullWidth>
                {creating ? 'Creating...' : 'Create Document'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Drawer>
    </Box>
  );
};
