'use client';

import { useEffect, useState, useMemo } from 'react';
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
import BalanceIcon from '@mui/icons-material/AccountBalanceWallet';
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

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
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

  // Pre-defined color mapping for different leave types for visual pop
  const getColorForLeaveType = (leaveName: string) => {
    const name = leaveName.toLowerCase();
    if (name.includes('sick')) return { bg: 'rgba(239, 68, 68, 0.1)', fill: '#ef4444', text: '#ef4444' };
    if (name.includes('casual')) return { bg: 'rgba(245, 158, 11, 0.1)', fill: '#f59e0b', text: '#f59e0b' };
    if (name.includes('paid') || name.includes('annual')) return { bg: 'rgba(16, 185, 129, 0.1)', fill: '#10b981', text: '#10b981' };
    return { bg: 'rgba(99, 102, 241, 0.1)', fill: '#6366f1', text: '#6366f1' }; // default indigo
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BalanceIcon sx={{ color: '#6366f1' }} /> 
          Leave Balances
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              borderColor: '#6366f1', 
              color: '#6366f1', 
              textTransform: 'none', 
              fontWeight: 700,
              px: 3,
              '&:hover': {
                borderColor: '#4f46e5',
                bgcolor: 'rgba(99, 102, 241, 0.04)'
              }
            }}
            onClick={() => router.push('/leaves')}
          >
            Apply Leave
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#6366f1', 
              minWidth: 48,
              p: 1,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: 'none'
              }
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
              bgcolor: '#ffffff', 
              borderRadius: 2, 
              minWidth: 100,
              fontWeight: 700,
              color: '#1e293b',
              boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
              '& fieldset': { border: 'none' }
            }}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      ) : currentYearBalances.length > 0 ? (
        <Grid container spacing={4}>
          {currentYearBalances.map((balance) => {
            const consumed = balance.granted_days - balance.balance_days;
            const utilization = balance.granted_days > 0
              ? Math.min(Math.max((consumed / balance.granted_days) * 100, 0), 100)
              : 0;
            const colors = getColorForLeaveType(balance.leave_type_name);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={balance.id}>
                <Card sx={commonCardStyles}>
                  <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors.fill }} />
                        <Typography sx={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 800 }}>
                          {balance.leave_type_name}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                        Available Balance
                      </Typography>
                      <Typography variant="h2" sx={{ fontWeight: 900, color: colors.fill }}>
                        {balance.balance_days.toString().padStart(2, '0')}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                          Consumed: {consumed}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                          Granted: {balance.granted_days}
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 8, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: `${utilization}%`, height: '100%', bgcolor: colors.fill, borderRadius: 4, transition: 'width 1s ease-in-out' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card sx={{ ...commonCardStyles, textAlign: 'center', p: 8 }}>
          <BalanceIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>No leave balances for selected year</Typography>
          <Typography sx={{ color: '#64748b' }}>Try another year or wait until balances are generated.</Typography>
        </Card>
      )}
    </Box>
  );
}
