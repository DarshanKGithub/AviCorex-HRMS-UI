'use client';

import { Box, Card, CardContent, Typography, Stack, Grid, Divider, Button } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

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


export default function ITStatementPage() {
  const currentYear = new Date().getFullYear();
  
  // High-fidelity Mock Data
  const mockItStatement = {
    grossIncome: 1500000,
    exemptions: 120000,
    deductions: 150000,
    taxableIncome: 1230000,
    taxComputed: 181500,
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: '#6366f1' }} /> 
          IT Statement (FY {currentYear-1}-{currentYear})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
        >
          Download PDF
        </Button>
      </Stack>

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 4 }}>
            Computation of Income Tax
          </Typography>

          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography sx={{ color: '#475569', fontWeight: 600 }}>1. Gross Salary Income</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>₹{mockItStatement.grossIncome.toLocaleString()}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography sx={{ color: '#475569', fontWeight: 600 }}>2. Less: Exemptions (HRA, LTA, etc.)</Typography>
              <Typography sx={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>- ₹{mockItStatement.exemptions.toLocaleString()}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography sx={{ color: '#475569', fontWeight: 600 }}>3. Less: Chapter VI-A Deductions (80C, 80D, etc.)</Typography>
              <Typography sx={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>- ₹{mockItStatement.deductions.toLocaleString()}</Typography>
            </Box>

            <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <Typography sx={{ color: '#4338ca', fontWeight: 700, fontSize: '1.1rem' }}>Net Taxable Income</Typography>
              <Typography sx={{ fontWeight: 900, color: '#4338ca', fontSize: '1.3rem' }}>₹{mockItStatement.taxableIncome.toLocaleString()}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', mt: 2 }}>
              <Typography sx={{ color: '#047857', fontWeight: 700, fontSize: '1.1rem' }}>Total Tax Computed</Typography>
              <Typography sx={{ fontWeight: 900, color: '#047857', fontSize: '1.3rem' }}>₹{mockItStatement.taxComputed.toLocaleString()}</Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 5, p: 3, bgcolor: '#f8fafc', borderRadius: 3 }}>
            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Disclaimer:</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
              This is a simulated IT statement generated for demonstration purposes. Once the tax computation engine is fully integrated, this page will reflect your actual tax liability based on the old/new regime selection.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
