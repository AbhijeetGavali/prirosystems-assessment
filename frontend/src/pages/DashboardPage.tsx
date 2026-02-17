import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetDashboardQuery } from '../store/api/documentApi';
import { useAppSelector } from '../hooks/redux';
import { UserRole } from '../types';

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#FFA726',      // Orange
  'InProgress': '#42A5F5',   // Blue
  'Approved': '#66BB6A',     // Green
  'Rejected': '#EF5350',     // Red
};

export const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardQuery();

  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight={600}>
              {stats?.totalDocuments || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Documents</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight={600}>
              {stats?.pendingCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === UserRole.APPROVER ? 'Pending Approvals' : 'Pending'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={600}>
              {stats?.approvedCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">Approved</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" fontWeight={600}>
              {stats?.rejectedCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">Rejected</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight={600}>
              {stats?.avgApprovalTimeHours.toFixed(1) || 0}
              <Typography component="span" variant="body1"> hrs</Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">Avg Approval Time</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
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
                  {chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
