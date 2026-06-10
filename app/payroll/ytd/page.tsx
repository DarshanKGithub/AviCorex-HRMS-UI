'use client';

import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Stack, Grid, Divider } from '@mui/material';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};

export default function YTDReportsPage() {
  const currentYear = new Date().getFullYear();
  const { token, status } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['payslips', currentYear],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/payroll/payslips?year=${currentYear}&page=1&size=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load payslips');
      return response.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const summary = useMemo(() => {
    const items = data?.items || [];
    const grossEarnings = items.reduce((total: number, item: any) => total + (item.gross_salary || 0), 0);
    const netEarnings = items.reduce((total: number, item: any) => total + (item.net_salary || 0), 0);
    const totalTax = items.reduce((total: number, item: any) => total + (item.total_tax || 0), 0);
    const monthsProcessed = new Set(items.map((item: any) => `${item.year}-${item.month}`)).size;

    return { grossEarnings, netEarnings, totalTax, monthsProcessed, hasPayslips: items.length > 0 };
  }, [data]);

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
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>
                  {isLoading ? 'Loading…' : summary.grossEarnings ? `₹${summary.grossEarnings.toLocaleString()}` : 'Not available'}
                </Typography>
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
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>
                  {isLoading ? 'Loading…' : summary.netEarnings ? `₹${summary.netEarnings.toLocaleString()}` : 'Not available'}
                </Typography>
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
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>
                  {isLoading ? 'Loading…' : summary.hasPayslips ? `${summary.monthsProcessed} Months` : 'No data'}
                </Typography>
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
                    {isLoading ? 'Loading…' : summary.totalTax ? `₹${summary.totalTax.toLocaleString()}` : 'Pending'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Total PF Contribution</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6', mt: 1 }}>
                    {isLoading ? 'Loading…' : 'Pending'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Total ESI Contribution</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b', mt: 1 }}>
                    {isLoading ? 'Loading…' : 'Pending'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />

          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3 }}>
            {isLoading ? (
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading year-to-date payroll totals…</Typography>
            ) : error ? (
              <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>Unable to load YTD payroll data.</Typography>
            ) : summary.hasPayslips ? (
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Year-to-date payroll totals are pulled from your payslip history. This view will update automatically as new payslips are posted.
              </Typography>
            ) : (
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                No payslip data is currently available for this year. This section will display your year-to-date payroll summary once payroll records exist.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
