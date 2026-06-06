'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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


export default function LoansPage() {
  const { token, user, status } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ loan_type: 'Personal', amount: 0, interest_rate: 0, emi_amount: 0, remaining_balance: 0 });

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.push('/login');
      return;
    }
    if (token && user) {
      fetchLoans();
    }
  }, [status, token, user, router]);

  async function fetchLoans() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/financials/loans`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setLoans(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function applyLoan() {
    try {
      const form = { ...loanForm, remaining_balance: loanForm.amount };
      const res = await fetch(`${API_BASE}/financials/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setOpenLoanModal(false);
        setLoanForm({ loan_type: 'Personal', amount: 0, interest_rate: 0, emi_amount: 0, remaining_balance: 0 });
        fetchLoans();
      } else {
        alert('Failed to submit loan application');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  const kpiStats = useMemo(() => {
    const activeLoans = loans.filter(l => l.status === 'Approved' || l.status === 'Pending').length;
    const totalAmount = loans.reduce((acc, l) => acc + (l.amount || 0), 0);
    const totalRemaining = loans.reduce((acc, l) => acc + (l.remaining_balance || 0), 0);
    return { activeLoans, totalAmount, totalRemaining };
  }, [loans]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon sx={{ color: '#6366f1' }} /> 
          Loans & Advances
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenLoanModal(true)} 
          sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
        >
          Apply for Loan
        </Button>
      </Stack>

      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Active Loans</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{kpiStats.activeLoans}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonetizationOnIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Total Borrowed</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>₹{kpiStats.totalAmount.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarMonthIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Remaining Balance</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>₹{kpiStats.totalRemaining.toLocaleString()}</Typography>
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
          ) : loans.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 10 }}>
              <CreditCardIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No active loans found.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Loan Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>EMI</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Remaining</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map(l => (
                  <TableRow key={l.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{l.loan_type}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>₹{l.amount?.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>₹{l.emi_amount?.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>₹{l.remaining_balance?.toLocaleString()}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                       <Chip 
                        label={l.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : l.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(241, 245, 249, 0.8)', 
                          color: l.status === 'Approved' ? '#059669' : l.status === 'Pending' ? '#d97706' : '#64748b',
                          fontWeight: 700,
                          borderRadius: '8px'
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openLoanModal} onClose={() => setOpenLoanModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b' }}>Apply for Loan</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Loan Type" fullWidth value={loanForm.loan_type} onChange={e => setLoanForm({...loanForm, loan_type: e.target.value})} placeholder="e.g. Personal, Salary Advance" />
            <TextField label="Amount (₹)" type="number" fullWidth value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: parseFloat(e.target.value) || 0})} />
            <TextField label="EMI Amount (₹)" type="number" fullWidth value={loanForm.emi_amount} onChange={e => setLoanForm({...loanForm, emi_amount: parseFloat(e.target.value) || 0})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenLoanModal(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={applyLoan} sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>Submit Application</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
