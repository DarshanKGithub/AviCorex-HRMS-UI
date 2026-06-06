'use client';

import { Box, Card, CardContent, Typography, Stack, Grid, Button, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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


export default function POIPage() {
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon sx={{ color: '#6366f1' }} /> 
          Proof Of Investment (FY {currentYear-1}-{currentYear})
        </Typography>
      </Stack>

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Submit Investment Proofs
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 4 }}>
            Upload documentation to support the tax declarations you made at the beginning of the financial year.
          </Typography>

          <Paper sx={{ p: 6, border: '2px dashed #cbd5e1', borderRadius: 4, bgcolor: '#f8fafc', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <CloudUploadIcon fontSize="large" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>Click to upload or drag and drop</Typography>
              <Typography sx={{ color: '#64748b', mt: 0.5 }}>PDF, JPG, PNG (Max 5MB per file)</Typography>
            </Box>
            <Button variant="contained" sx={{ mt: 2, bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>
              Select Files
            </Button>
          </Paper>

          <Box sx={{ mt: 5, p: 3, bgcolor: '#f8fafc', borderRadius: 3 }}>
            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Note:</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
              This page currently displays a simulated file upload area. Document processing and storage logic will be activated once the backend API is ready.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
