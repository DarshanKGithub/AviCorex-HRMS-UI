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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c' }}>
          Comp-Off Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#3b82f6', textTransform: 'none', fontWeight: 600 }}
        >
          Request Comp-Off
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Worked Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#6b7280' }}>
                    No comp-off requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                    <TableCell>{new Date(req.worked_date).toLocaleDateString()}</TableCell>
                    <TableCell>{req.reason || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(req.status),
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {req.status === 'Pending' && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleApprove(req.id)}
                            disabled={approving === req.id}
                            sx={{ bgcolor: '#10b981' }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleReject(req.id)}
                            disabled={approving === req.id}
                            sx={{ bgcolor: '#ef4444' }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Comp-Off</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Worked Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.worked_date}
              onChange={(e) => setFormData({ ...formData, worked_date: e.target.value })}
              helperText="Date when you worked (usually weekend)"
            />
            <TextField
              label="Reason (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}
          >
            Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
