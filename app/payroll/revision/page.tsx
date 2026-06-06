'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
};

export default function SalaryRevisionPage() {
  const { token, status } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['salaryHistory', 1, 10],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/payroll/salary-history?page=1&size=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load salary history');
      return response.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const salaryHistory = data?.items ?? [];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoGraphIcon sx={{ color: '#6366f1' }} />
          Salary Revision History
        </Typography>
      </Stack>

      <Card sx={{ ...commonCardStyles, p: 1 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748b' }}>Loading salary revision history...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#ef4444' }}>Unable to load salary revision history.</Typography>
            </Box>
          ) : salaryHistory.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748b' }}>No salary revisions are available for your account.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Effective Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Base Salary</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Change Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryHistory.map((revision: any) => (
                  <TableRow key={revision.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{new Date(revision.effective_from).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>₹{revision.base_salary.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{revision.grade || 'N/A'}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>{revision.reason_for_change || 'Salary update'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}
