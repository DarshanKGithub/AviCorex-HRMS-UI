'use client';

import { useEffect, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const commonCardStyles = {
  borderRadius: 4,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  bgcolor: '#ffffff',
  height: '100%'
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Payslip = {
  id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  status: string;
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PayslipsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchPayslips();
    }
  }, [auth.status, auth.token, router]);

  async function fetchPayslips() {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/payroll/payslips`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayslips(data.items || []);
      } else if (res.status !== 401) {
        setError('Error fetching payslips');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPayslip(id: string, month: number, year: number) {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/payroll/payslips/${id}/pdf`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${monthNames[month - 1]}_${year}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to download payslip');
      }
    } catch (err) {
      console.error(err);
      alert('Error downloading payslip');
    }
  }

  const kpiStats = useMemo(() => {
    const total = payslips.length;
    let average = 0;
    let latest = 0;
    
    if (total > 0) {
      // Assuming payslips are returned in chronological order, latest is index 0
      latest = payslips[0].net_salary;
      const sum = payslips.reduce((acc, p) => acc + p.net_salary, 0);
      average = sum / total;
    }

    return { total, average, latest };
  }, [payslips]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
          My Payslips
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* KPI Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpRoundedIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Latest Net Salary</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>${kpiStats.latest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FunctionsRoundedIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Average Net Salary</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>${kpiStats.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PaymentsRoundedIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Total Payslips</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{kpiStats.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ ...commonCardStyles, p: 1 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : payslips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <PaymentsRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No payslips found.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Month / Year</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Gross Salary</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Net Salary</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', textAlign: 'right', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                      {monthNames[payslip.month - 1]} {payslip.year}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                      ${payslip.gross_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                      ${payslip.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                      <Chip 
                        label={payslip.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: payslip.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(241, 245, 249, 0.8)', 
                          color: payslip.status === 'Paid' ? '#059669' : '#64748b',
                          fontWeight: 700,
                          borderRadius: '8px'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                      <Tooltip title="Download PDF">
                        <Button 
                          startIcon={<PictureAsPdfRoundedIcon />}
                          variant="contained" 
                          size="small"
                          onClick={() => downloadPayslip(payslip.id, payslip.month, payslip.year)}
                          sx={{ 
                            textTransform: 'none', 
                            borderRadius: 2, 
                            fontWeight: 700,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.2)',
                              boxShadow: 'none'
                            }
                          }}
                        >
                          Download
                        </Button>
                      </Tooltip>
                    </TableCell>
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
