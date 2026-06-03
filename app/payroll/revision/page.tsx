'use client';

import { Box, Card, CardContent, Typography, Stack, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const commonCardStyles = {
  borderRadius: 4,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  bgcolor: '#ffffff',
  height: '100%'
};

export default function SalaryRevisionPage() {
  // High-fidelity Mock Data
  const mockRevisions = [
    { date: '2025-04-01', previous: 1200000, revised: 1500000, percentage: 25, reason: 'Annual Appraisal' },
    { date: '2024-04-01', previous: 1000000, revised: 1200000, percentage: 20, reason: 'Promotion' },
    { date: '2023-04-01', previous: 900000, revised: 1000000, percentage: 11.1, reason: 'Annual Appraisal' },
  ];

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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Previous CTC</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Revised CTC</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Hike %</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockRevisions.map((rev, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{new Date(rev.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>₹{rev.previous.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>₹{rev.revised.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669', fontWeight: 700 }}>
                      <TrendingUpIcon fontSize="small" />
                      {rev.percentage}%
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                    <Chip 
                      label={rev.reason} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(99, 102, 241, 0.1)', 
                        color: '#4f46e5',
                        fontWeight: 700,
                        borderRadius: '8px'
                      }} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ p: 3, m: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Note:</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
              This page currently displays simulated salary revision history. Once the salary revision API is implemented, it will reflect your actual promotion and appraisal history.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
