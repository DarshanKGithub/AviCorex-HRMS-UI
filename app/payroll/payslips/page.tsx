'use client';

import { useEffect, useState } from 'react';
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
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

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

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c' }}>
          My Payslips
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : payslips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PaymentsRoundedIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
              <Typography sx={{ color: '#6b7280' }}>No payslips found.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Month / Year</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Gross Salary</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Net Salary</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>{monthNames[payslip.month - 1]} {payslip.year}</TableCell>
                    <TableCell>${payslip.gross_salary.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>${payslip.net_salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payslip.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: payslip.status === 'Paid' ? '#dcfce7' : '#f3f4f6', 
                          color: payslip.status === 'Paid' ? '#166534' : '#4b5563',
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button 
                        startIcon={<DownloadRoundedIcon />} 
                        variant="outlined" 
                        size="small"
                        onClick={() => downloadPayslip(payslip.id, payslip.month, payslip.year)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Download PDF
                      </Button>
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
