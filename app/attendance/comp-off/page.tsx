'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE = getApiBaseUrl();

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};


interface CompOffRequest {
  id: string;
  employee_id: string;
  worked_date: string;
  reason?: string;
  leave_balance_id?: string;
  status: string;
  approver_id?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  items: CompOffRequest[];
  total: number;
  page: number;
  size: number;
}

export default function CompOffPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CompOffRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    worked_date: '',
    reason: '',
  });

  useEffect(() => {
    if (token) {
      fetchCompOffRequests();
    }
  }, [token, page]);

  async function fetchCompOffRequests() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/comp-off-requests?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setRequests(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      setError('Failed to load comp-off requests');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.worked_date) {
      setError('Please select a date');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/comp-off-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: user?.id,
          worked_date: formData.worked_date,
          reason: formData.reason || null,
        }),
      });

      if (res.ok) {
        setSuccess('Comp-off request created');
        setOpenModal(false);
        setFormData({ worked_date: '', reason: '' });
        await fetchCompOffRequests();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to create request');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/comp-off-requests/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess('Comp-off approved');
        await fetchCompOffRequests();
      }
    } finally {
      setApproving(null);
    }
  }

  async function handleReject(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/comp-off-requests/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess('Comp-off rejected');
        await fetchCompOffRequests();
      }
    } finally {
      setApproving(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'approved':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
    }
  };

  const pendingRequests = requests.filter(req => req.status.toLowerCase() === 'pending').length;
  const approvedRequests = requests.filter(req => req.status.toLowerCase() === 'approved').length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailableIcon sx={{ color: '#6366f1' }} /> 
          Comp-Off Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ 
            bgcolor: '#6366f1', 
            textTransform: 'none', 
            fontWeight: 700, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            '&:hover': { bgcolor: '#4f46e5' }
          }}
        >
          Request Comp-Off
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Requests</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#6366f1' }}>{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#10b981' }}>{approvedRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approvals</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#f59e0b' }}>{pendingRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: 0 }}>
          {loading && requests.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <EventAvailableIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>No comp-off requests found</Typography>
              <Typography sx={{ color: '#64748b' }}>Worked on a holiday? Request a compensatory off day.</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Worked Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', align: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => {
                    const colors = getStatusColor(req.status);
                    return (
                      <TableRow key={req.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9', py: 2.5 } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{new Date(req.worked_date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{req.reason || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={req.status}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.text,
                              fontWeight: 700,
                              px: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {req.status === 'Pending' ? (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ThumbUpIcon sx={{ fontSize: '1.1rem !important' }} />}
                                onClick={() => handleApprove(req.id)}
                                disabled={approving === req.id}
                                sx={{ bgcolor: '#10b981', boxShadow: 'none', px: 1.5, py: 0.5, borderRadius: 1.5, minWidth: 0, textTransform: 'none', fontWeight: 600 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ThumbDownIcon sx={{ fontSize: '1.1rem !important' }} />}
                                onClick={() => handleReject(req.id)}
                                disabled={approving === req.id}
                                sx={{ bgcolor: '#ef4444', boxShadow: 'none', px: 1.5, py: 0.5, borderRadius: 1.5, minWidth: 0, textTransform: 'none', fontWeight: 600 }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          ) : (
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Processed</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.25rem' }}>Request Comp-Off</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Worked Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.worked_date}
              onChange={(e) => setFormData({ ...formData, worked_date: e.target.value })}
              helperText="Date when you worked (usually weekend or holiday)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
            <TextField
              label="Reason (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
