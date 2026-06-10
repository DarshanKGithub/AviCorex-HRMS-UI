'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Grid, Divider, Button } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
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

export default function ITStatementPage() {
  const currentYear = new Date().getFullYear();
  const { token, status } = useAuth();

  const { data: salaryData, isLoading, error } = useQuery({
    queryKey: ['currentSalary'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/payroll/salary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load salary details');
      return response.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const baseSalary = salaryData?.base_salary ? `₹${salaryData.base_salary.toLocaleString()}` : 'Not available';
  const salaryGrade = salaryData?.grade || 'None';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: '#6366f1' }} />
          IT Statement (FY {currentYear - 1}-{currentYear})
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
          disabled
        >
          Download PDF
        </Button>
      </Stack>

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 4 }}>
            Income Tax Statement Overview
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 1, bgcolor: '#f8fafc' }}>
                <Typography sx={{ color: '#475569', fontWeight: 600, mb: 1 }}>Current Base Salary</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.00rem' }}>{isLoading ? 'Loading…' : baseSalary}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 1, bgcolor: '#f8fafc' }}>
                <Typography sx={{ color: '#475569', fontWeight: 600, mb: 1 }}>Salary Grade</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.00rem' }}>{isLoading ? 'Loading…' : salaryGrade}</Typography>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 1, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {isLoading ? (
              <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>Loading your IT statement details…</Typography>
            ) : error ? (
              <Typography sx={{ color: '#ef4444', fontSize: '0.95rem' }}>Unable to load IT statement data at this time.</Typography>
            ) : (
              <>
                <Typography sx={{ color: '#475569', fontWeight: 600 }}>Tax data is not yet available for this view.</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', mt: 1 }}>
                  This page will display your actual income tax computation when the payroll tax API is integrated.
                </Typography>
              </>
            )}
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
