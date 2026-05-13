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
import { API_BASE_URL } from '@/lib/apiBase';

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchBalances();
    } else if (auth.status === 'ready') {
      setLoading(false);
    }
  }, [auth.status, auth.token, router]);

  async function fetchBalances() {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/leave/balances/with-details`, {
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

  useEffect(() => {
    if (!balances.length) {
      return;
    }

    const availableYears = [...new Set(balances.map((balance) => balance.year))].sort((a, b) => b - a);
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [balances, selectedYear]);

  const yearOptions = [...new Set([new Date().getFullYear(), ...balances.map((balance) => balance.year)])].sort((a, b) => b - a);

  const currentYearBalances = balances.filter((b) => b.year === selectedYear);

  function downloadYearBalancesCsv() {
    if (currentYearBalances.length === 0) {
      setError('No balances available to export for selected year.');
      return;
    }

    const header = ['leave_type', 'year', 'granted_days', 'balance_days', 'consumed_days'];
    const rows = currentYearBalances.map((balance) => {
      const consumed = Math.max(balance.granted_days - balance.balance_days, 0);
      return [
        JSON.stringify(balance.leave_type_name),
        String(balance.year),
        String(balance.granted_days),
        String(balance.balance_days),
        String(consumed),
      ].join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-balances-${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Leave Balances
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              borderColor: '#a78bfa', 
              color: '#7c3aed', 
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
              bgcolor: '#7c3aed', 
              minWidth: 48,
              p: 1
            }}
            onClick={downloadYearBalancesCsv}
          >
            <DownloadRoundedIcon />
          </Button>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as number)}
            size="small"
            sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              minWidth: 100,
              fontWeight: 600,
              '& fieldset': { borderColor: '#e5e7eb' }
            }}
          >
            {yearOptions.map((year) => (
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
      ) : currentYearBalances.length > 0 ? (
        <Grid container spacing={3}>
          {currentYearBalances.map((balance) => {
            const consumed = balance.granted_days - balance.balance_days;
            const utilization = balance.granted_days > 0
              ? Math.min(Math.max((consumed / balance.granted_days) * 100, 0), 100)
              : 0;
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
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 }}>
                        {balance.leave_type_name}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        Granted: {balance.granted_days}
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ textAlign: 'center', my: 2, flex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 400, color: 'text.primary', mb: 0.5 }}>
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
                            color: '#7c3aed', 
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
                          <Box sx={{ width: `${utilization}%`, height: '100%', bgcolor: '#d1d5db' }} />
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
      ) : (
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>No leave balances for selected year</Typography>
            <Typography sx={{ color: '#9ca3af' }}>Try another year or wait until balances are generated.</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
