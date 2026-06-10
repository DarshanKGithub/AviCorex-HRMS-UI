'use client';

import { Box, Card, CardContent, Typography, Stack, Grid, Divider, Button, TextField } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import SaveIcon from '@mui/icons-material/Save';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};


export default function ITDeclarationPage() {
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon sx={{ color: '#6366f1' }} /> 
          IT Declaration (FY {currentYear-1}-{currentYear})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
        >
          Save Declaration
        </Button>
      </Stack>

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Investment Declarations
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 4 }}>
            Declare your proposed investments to adjust your TDS. Proofs must be submitted at year-end.
          </Typography>

          <Stack spacing={4}>
            {/* Section 80C */}
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#475569', mb: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>Section 80C (Max Limit: ₹1,50,000)</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Life Insurance Premium (LIC)" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Public Provident Fund (PPF)" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="ELSS Mutual Funds" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Children's Tuition Fee" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Principal Repayment of Housing Loan" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
              </Grid>
            </Box>

            {/* Section 80D */}
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#475569', mb: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>Section 80D (Medical Insurance)</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Medical Insurance (Self/Family)" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Medical Insurance (Parents)" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
              </Grid>
            </Box>
            
            {/* HRA */}
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#475569', mb: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>House Rent Allowance (HRA)</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Annual Rent Paid" type="number" fullWidth defaultValue={0} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#94a3b8' }}>₹</Typography> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Landlord PAN (if rent > ₹1,00,000)" fullWidth placeholder="ABCDE1234F" />
                </Grid>
              </Grid>
            </Box>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
