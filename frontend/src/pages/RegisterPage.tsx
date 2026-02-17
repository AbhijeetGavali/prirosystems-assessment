import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import { useRegisterMutation } from '../store/api/authApi';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { UserRole } from '../types';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SUBMITTER,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(formData).unwrap();
      if (response.success && response.data) {
        dispatch(setCredentials(response.data));
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            margin="normal"
            required
          >
            <MenuItem value={UserRole.SUBMITTER}>Submitter</MenuItem>
            <MenuItem value={UserRole.APPROVER}>Approver</MenuItem>
            <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
          </TextField>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          <Button fullWidth variant="text" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
