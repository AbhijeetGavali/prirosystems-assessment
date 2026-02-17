import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
