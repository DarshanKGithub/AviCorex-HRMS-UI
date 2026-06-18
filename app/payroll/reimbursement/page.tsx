'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE = getApiBaseUrl();

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};

export default function ReimbursementPage() {
  const { token, user, status } = useAuth();
  const router = useRouter();
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReimModal, setOpenReimModal] = useState(false);
  const [reimForm, setReimForm] = useState({ expense_type: 'Travel', amount: 0, description: '' });

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.push('/login');
      return;
    }
    if (token && user) {
      fetchReimbursements();
    }
  }, [status, token, user, router]);

  async function fetchReimbursements() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/financials/reimbursements`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setReimbursements(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function applyReimbursement() {
    try {
      const res = await fetch(`${API_BASE}/financials/reimbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reimForm)
      });
      if (res.ok) {
        setOpenReimModal(false);
        setReimForm({ expense_type: 'Travel', amount: 0, description: '' });
        fetchReimbursements();
      } else {
        alert('Failed to submit reimbursement');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  const kpiStats = useMemo(() => {
    const pendingCount = reimbursements.filter(r => r.status === 'Pending').length;
    const approvedAmount = reimbursements.filter(r => r.status === 'Approved').reduce((acc, r) => acc + (r.amount || 0), 0);
    const rejectedCount = reimbursements.filter(r => r.status === 'Rejected').length;
    return { pendingCount, approvedAmount, rejectedCount };
  }, [reimbursements]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon sx={{ color: '#6366f1' }} /> 
          Reimbursements
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenReimModal(true)} 
          sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
        >
          Claim Reimbursement
        </Button>
      </Stack>

      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PendingActionsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Pending Claims</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{kpiStats.pendingCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Approved Amount</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>₹{kpiStats.approvedAmount.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CancelIcon fontSize="large" />
              </Box>
              <Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Rejected Claims</Typography>
                <Typography sx={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{kpiStats.rejectedCount}</Typography>
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
          ) : reimbursements.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 10 }}>
              <ReceiptIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No reimbursement claims found.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Expense Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none' }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b', borderBottom: 'none', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reimbursements.map(r => (
                  <TableRow key={r.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.expense_type}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>₹{r.amount?.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>{new Date(r.applied_on).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                       <Chip 
                        label={r.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: r.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : r.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                          color: r.status === 'Approved' ? '#059669' : r.status === 'Pending' ? '#d97706' : '#dc2626',
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

      <Dialog open={openReimModal} onClose={() => setOpenReimModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b' }}>Claim Reimbursement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Expense Type" fullWidth value={reimForm.expense_type} onChange={e => setReimForm({...reimForm, expense_type: e.target.value})} placeholder="e.g. Travel, Internet" />
            <TextField label="Amount (₹)" type="number" fullWidth value={reimForm.amount} onChange={e => setReimForm({...reimForm, amount: parseFloat(e.target.value) || 0})} />
            <TextField label="Description" fullWidth multiline rows={3} value={reimForm.description} onChange={e => setReimForm({...reimForm, description: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenReimModal(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={applyReimbursement} sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>Submit Claim</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
