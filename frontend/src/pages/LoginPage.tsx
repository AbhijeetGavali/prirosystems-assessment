import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(formData).unwrap();
      if (response.success && response.data) {
        dispatch(setCredentials(response.data));
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Button fullWidth variant="text" sx={{ mt: 2 }} onClick={() => navigate('/register')}>
            Don't have an account? Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
