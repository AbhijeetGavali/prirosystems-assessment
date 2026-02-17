import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { toast } from 'react-toastify';

export const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutMutation({ refreshToken }).unwrap();
      }
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Workflow System
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              {user.name} ({user.role})
            </Typography>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate('/documents')}>
              Documents
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
