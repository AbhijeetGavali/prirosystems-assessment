import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import { useCreateDocumentMutation } from '../store/api/documentApi';
import { useGetApproversQuery } from '../store/api/userApi';
import { toast } from 'react-toastify';
import { Navbar } from '../components/Navbar';

export const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const [createDocument, { isLoading }] = useCreateDocumentMutation();
  const { data: approversData, isLoading: approversLoading } = useGetApproversQuery();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileLink: '',
    approverIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createDocument(formData).unwrap();
      if (response.success) {
        toast.success('Document created successfully!');
        navigate('/documents');
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || 'Failed to create document');
    }
  };

  if (approversLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const approvers = approversData?.data || [];

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create New Document
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="File Link"
              value={formData.fileLink}
              onChange={(e) => setFormData({ ...formData, fileLink: e.target.value })}
              margin="normal"
              type="url"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Approvers (in order)</InputLabel>
              <Select
                multiple
                value={formData.approverIds}
                onChange={(e) => setFormData({ ...formData, approverIds: e.target.value as string[] })}
                input={<OutlinedInput label="Approvers (in order)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const approver = approvers.find((a) => a.id === value);
                      return <Chip key={value} label={approver?.name} />;
                    })}
                  </Box>
                )}
              >
                {approvers.map((approver) => (
                  <MenuItem key={approver.id} value={approver.id}>
                    {approver.name} ({approver.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Document'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/documents')}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};
