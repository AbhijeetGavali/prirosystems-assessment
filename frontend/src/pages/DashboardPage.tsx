import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetDashboardQuery } from '../store/api/documentApi';
import { useGetPendingDocumentsQuery } from '../store/api/documentApi';
import { useAppSelector } from '../hooks/redux';
import { UserRole } from '../types';
import { Navbar } from '../components/Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardQuery();
  const { data: pendingData } = useGetPendingDocumentsQuery(undefined, {
    skip: user?.role !== UserRole.APPROVER,
  });

  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = dashboardData?.data;
  const chartData = stats?.statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Total Documents */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Total Documents
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography variant="h3" color="primary">
                  {stats?.totalDocuments || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Approved Count */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Approved
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography variant="h3" color="success.main">
                  {stats?.approvedCount || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Rejected Count */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Rejected
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography variant="h3" color="error.main">
                  {stats?.rejectedCount || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Average Approval Time */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Avg Approval Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography variant="h3" color="info.main">
                  {stats?.avgApprovalTimeHours.toFixed(1) || 0}
                  <Typography component="span" variant="h6"> hrs</Typography>
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Pending Tasks for Approver */}
          {user?.role === UserRole.APPROVER && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Tasks
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Typography variant="h3" color="warning.main">
                    {pendingData?.data?.length || 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Status Distribution Chart */}
          <Grid item xs={12} md={user?.role === UserRole.APPROVER ? 6 : 12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
