'use client';

import { Box, Card, CardContent, Typography, Stack, Grid, Divider } from '@mui/material';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const commonCardStyles = {
  borderRadius: 4,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  bgcolor: '#ffffff',
  height: '100%'
};

export default function YTDReportsPage() {
  const currentYear = new Date().getFullYear();
  
  // High-fidelity Mock Data for UI demonstration
  const mockYtdData = {
    grossEarnings: 1245000,
    netEarnings: 980500,
    totalTax: 185000,
    totalPF: 59500,
    totalESI: 20000,
    monthsProcessed: 8,
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertChartOutlinedRoundedIcon sx={{ color: '#6366f1' }} /> 
          YTD Reports ({currentYear})
        </Typography>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>YTD Gross Earnings</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>₹{mockYtdData.grossEarnings.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceWalletIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>YTD Net Earnings</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>₹{mockYtdData.netEarnings.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RequestQuoteIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Months Processed</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{mockYtdData.monthsProcessed} Months</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>
            Statutory Deductions Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Total Income Tax</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444', mt: 1 }}>
                    ₹{mockYtdData.totalTax.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Total PF Contribution</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#3b82f6', mt: 1 }}>
                    ₹{mockYtdData.totalPF.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Total ESI Contribution</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b', mt: 1 }}>
                    ₹{mockYtdData.totalESI.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />
          
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3 }}>
            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Note:</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
              This page currently displays simulated data as the backend API for YTD reports is under development. Once the API is available, this dashboard will automatically sync with your real-time payroll data.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
