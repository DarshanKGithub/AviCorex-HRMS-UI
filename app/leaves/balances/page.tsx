'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type LeaveBalance = {
  id: string;
  leave_type_name: string;
  year: number;
  granted_days: number;
  balance_days: number;
};

export default function LeaveBalancesPage() {
  const auth = useAuth();
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchBalances();
    }
  }, [auth.status, auth.token, router]);

  async function fetchBalances() {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/leave/balances/with-details`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalances(data || []);
      } else if (res.status !== 401) {
        setError('Error fetching balances');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const currentYearBalances = balances.filter((b) => b.year === selectedYear);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c' }}>
          Leave Balances
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              borderColor: '#60a5fa', 
              color: '#3b82f6', 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3 
            }}
            onClick={() => router.push('/leaves')}
          >
            Apply
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#3b82f6', 
              minWidth: 48,
              p: 1
            }}
          >
            <DownloadRoundedIcon />
          </Button>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as number)}
            size="small"
            sx={{ 
              bgcolor: '#fff', 
              borderRadius: 2, 
              minWidth: 100,
              fontWeight: 600,
              '& fieldset': { borderColor: '#e5e7eb' }
            }}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentYearBalances.map((balance) => {
            const consumed = balance.granted_days - balance.balance_days;
            return (
              <Grid item xs={12} sm={6} md={3} key={balance.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 2, 
                    border: '1px solid #e5e7eb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                      <Typography sx={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
                        {balance.leave_type_name}
                      </Typography>
                      <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Granted: {balance.granted_days}
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ textAlign: 'center', my: 2, flex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 400, color: '#111827', mb: 0.5 }}>
                        {balance.balance_days.toString().padStart(2, '0')}
                      </Typography>
                      <Typography sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                        Balance
                      </Typography>
                      
                      {balance.granted_days > 0 && (
                        <Button 
                          variant="text" 
                          sx={{ 
                            mt: 2, 
                            textTransform: 'none', 
                            color: '#3b82f6', 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </Box>

                    {balance.granted_days > 0 ? (
                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ height: 4, bgcolor: '#e5e7eb', borderRadius: 2, mb: 1, overflow: 'hidden' }}>
                          <Box sx={{ width: `${(consumed / balance.granted_days) * 100}%`, height: '100%', bgcolor: '#d1d5db' }} />
                        </Box>
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          {consumed} of {balance.granted_days} Consumed
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 'auto', height: 20 }} /> // Spacer to align cards
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
