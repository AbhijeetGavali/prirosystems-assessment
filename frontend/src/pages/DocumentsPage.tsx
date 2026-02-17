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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGetDocumentsQuery, useCreateDocumentMutation } from '../store/api/documentApi';
import { useGetApproversQuery } from '../store/api/userApi';
import { useAppSelector } from '../hooks/redux';
import { UserRole, DocumentStatus } from '../types';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorHandler';

interface SortableApproverProps {
  approver: { id: string; name: string; email: string };
  index: number;
  onRemove: () => void;
}

const SortableApprover = ({ approver, index, onRemove }: SortableApproverProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: approver.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
      }}
      secondaryAction={
        <IconButton edge="end" size="small" onClick={onRemove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      }
    >
      <Box {...attributes} {...listeners} sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        <DragIcon sx={{ color: 'text.secondary' }} />
      </Box>
      <Chip label={index + 1} size="small" sx={{ mr: 1, minWidth: 32 }} />
      <ListItemText primary={approver.name} secondary={approver.email} />
    </ListItem>
  );
};

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  
  const { data, isLoading } = useGetDocumentsQuery({ page, limit: 10, status: status || undefined });
  const { data: approversData } = useGetApproversQuery();
  const [createDocument, { isLoading: creating }] = useCreateDocumentMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileLink: '',
    approverIds: [] as string[],
  });

  const [selectedApprovers, setSelectedApprovers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [errors, setErrors] = useState({
    approverIds: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedApprovers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setFormData({ ...formData, approverIds: newOrder.map((a) => a.id) });
        return newOrder;
      });
    }
  };

  const isFormDirty = () => {
    return formData.title || formData.description || formData.fileLink || selectedApprovers.length > 0;
  };

  const handleDrawerClose = () => {
    if (isFormDirty()) {
      setConfirmClose(true);
    } else {
      resetForm();
      setDrawerOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', fileLink: '', approverIds: [] });
    setSelectedApprovers([]);
    setErrors({ approverIds: false });
  };

  const handleConfirmClose = () => {
    setConfirmClose(false);
    resetForm();
    setDrawerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.approverIds.length === 0) {
      setErrors({ approverIds: true });
      toast.error('Please select at least one approver');
      return;
    }
    
    try {
      await createDocument(formData).unwrap();
      toast.success('Document created successfully!');
      resetForm();
      setDrawerOpen(false);
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
              <TableCell><strong>Current Approver</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No documents found</TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const currentStage = doc.stages[doc.currentStageNumber - 1];
                const currentApprover = currentStage?.approverId;
                
                return (
                  <TableRow key={doc._id} hover>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.submitterId.name}</TableCell>
                    <TableCell>
                      <Chip label={doc.status} color={getStatusColor(doc.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {doc.status === DocumentStatus.APPROVED
                        ? `${doc.stages.length}/${doc.stages.length}`
                        : doc.status === DocumentStatus.REJECTED
                        ? `${doc.currentStageNumber}/${doc.stages.length} (Rejected)`
                        : `${Math.min(doc.currentStageNumber, doc.stages.length)}/${doc.stages.length}`}
                    </TableCell>
                    <TableCell>
                      {doc.status === DocumentStatus.APPROVED || doc.status === DocumentStatus.REJECTED
                        ? '-'
                        : currentApprover
                        ? `${currentApprover.name}`
                        : '-'}
                    </TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/documents/${doc._id}`)}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>Create Document</Typography>
            <IconButton onClick={handleDrawerClose}>
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
                options={approvers.filter((a) => !selectedApprovers.find((s) => s.id === a.id))}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={null}
                disabled={selectedApprovers.length >= 10}
                onChange={(_, newValue) => {
                  if (newValue && selectedApprovers.length < 10) {
                    const newApprovers = [...selectedApprovers, newValue];
                    setSelectedApprovers(newApprovers);
                    setFormData({ ...formData, approverIds: newApprovers.map((a) => a.id) });
                    setErrors({ ...errors, approverIds: false });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add Approver"
                    placeholder={selectedApprovers.length >= 10 ? 'Maximum 10 approvers reached' : 'Search and select approver'}
                    helperText={`${selectedApprovers.length}/10 approvers`}
                  />
                )}
                blurOnSelect
                clearOnBlur
                openOnFocus
              />

              {selectedApprovers.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Approval Order (Drag to reorder)
                  </Typography>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={selectedApprovers.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                      <List sx={{ p: 0 }}>
                        {selectedApprovers.map((approver, index) => (
                          <SortableApprover
                            key={approver.id}
                            approver={approver}
                            index={index}
                            onRemove={() => {
                              const newApprovers = selectedApprovers.filter((a) => a.id !== approver.id);
                              setSelectedApprovers(newApprovers);
                              setFormData({ ...formData, approverIds: newApprovers.map((a) => a.id) });
                            }}
                          />
                        ))}
                      </List>
                    </SortableContext>
                  </DndContext>
                </Box>
              )}

              {errors.approverIds && (
                <Typography variant="caption" color="error">
                  At least one approver is required
                </Typography>
              )}
              <Button type="submit" variant="contained" size="large" disabled={creating} fullWidth>
                {creating ? 'Creating...' : 'Create Document'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Drawer>

      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to close? All data will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmClose(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmClose} variant="contained" color="error">
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
