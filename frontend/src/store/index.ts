import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { documentApi } from './api/documentApi';
import { userApi } from './api/userApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, documentApi.middleware, userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
