import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { CreateDocumentPage } from './pages/CreateDocumentPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { UserRole } from './types';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/create"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUBMITTER, UserRole.ADMIN]}>
                  <CreateDocumentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute>
                  <DocumentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
