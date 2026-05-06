'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#15162c' }}>
        Good Morning
      </Typography>
      <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 3 }}>
        "Either you run the day, or the day runs you." - Jim Rohn
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Banner */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, bgcolor: '#ebf5ff', border: 'none', boxShadow: 'none' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1e3a8a', fontWeight: 700, mb: 1 }}>
                      Unite by HRMS
                    </Typography>
                    <Typography sx={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                      Your Gateway to Possibilities
                    </Typography>
                  </Box>
                  <Button variant="contained" sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 2 }}>
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Review & Track */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, mb: 4, color: '#15162c' }}>Review</Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ width: 64, height: 64, bgcolor: '#f3f4f6', borderRadius: '50%', mx: 'auto', mb: 2 }} />
                    <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>Hurrah! You've nothing to review.</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, mb: 4, color: '#15162c' }}>Track</Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ width: 64, height: 64, bgcolor: '#f3f4f6', borderRadius: '50%', mx: 'auto', mb: 2 }} />
                    <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>All good! You've nothing new to track.</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Sign In Card */}
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c', mb: 1 }}>
                  3 May 2026
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 3 }}>
                  Sunday | General 23:03:55
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => router.push('/attendance')}
                  sx={{ bgcolor: '#3b82f6', textTransform: 'none', py: 1.5, borderRadius: 2, fontSize: '1rem' }}
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, color: '#15162c', mb: 2 }}>Upcoming Holidays</Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 2 }}>01 May 2026</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>Labour Day</Typography>
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>Apply</Button>
                </Stack>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 2 }}>16 Jun 2026</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>Bakrid</Typography>
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>Apply</Button>
                </Stack>
                <Button variant="text" sx={{ width: '100%', mt: 2, textTransform: 'none', color: '#3b82f6' }} onClick={() => router.push('/leaves/holidays')}>
                  View all
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
