'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useAuth } from '../../components/auth/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type LeaveBalance = {
  id: string;
  leave_type_id: string;
  year: number;
  balance_days: number;
};

type LeaveRequest = {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
};

export default function LeavesPage() {
  const auth = useAuth();
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchBalances();
      fetchRequests();
    }
  }, [auth.status, auth.token, router]);

  async function fetchBalances() {
    try {
      const res = await fetch(`${API_BASE}/leave/balances`, {
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setBalances(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests() {
    try {
      const url = new URL(`${API_BASE}/leave/requests`);
      url.searchParams.set('employee_id', auth.user?.id ?? '');
      const res = await fetch(url.toString(), { headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' } });
      if (res.ok) {
        const payload = await res.json();
        setRequests(payload.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.token) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/leave/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          leave_type_id: form.leave_type_id,
          start_date: form.start_date,
          end_date: form.end_date,
          reason: form.reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Unable to create leave request');
        return;
      }

      await fetchRequests();
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      setSuccess('Leave request created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function approve(requestId: string, approve: boolean) {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/leave/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ approve }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Unable to update');
        return;
      }
      setSuccess(approve ? 'Leave approved!' : 'Leave rejected!');
      setTimeout(() => setSuccess(null), 2000);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      setError('Error updating request');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <CloseIcon sx={{ fontSize: 16 }} />;
      case 'pending':
        return <HourglassTopIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <Box className="mx-auto max-w-6xl px-4 py-6">
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Chip label="Time Off" sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c' }}>
            Leave Management
          </Typography>
          <Typography sx={{ mt: 1, color: '#5b5f7a', lineHeight: 1.8 }}>
            Request, track, and manage your leave balances and requests
          </Typography>
        </Box>

        {/* Alerts */}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Balances Grid */}
            {balances.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c', mb: 2 }}>
                  Your Leave Balances
                </Typography>
                <Grid container spacing={2}>
                  {balances.map((b) => (
                    <Grid item xs={12} sm={6} md={4} key={b.id}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 4px 12px rgba(17, 24, 39, 0.04)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 12px 24px rgba(17, 24, 39, 0.08)' } }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={1.5}>
                            <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                              {b.leave_type_id}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 800, color: '#15162c' }}>
                                {b.balance_days}
                              </Typography>
                              <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>
                                days available
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                              Year {b.year}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Request Form */}
            <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c', mb: 3 }}>
                  Request Leave
                </Typography>
                <form onSubmit={submitRequest}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Leave Type ID"
                        value={form.leave_type_id}
                        onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
                        fullWidth
                        size="small"
                        required
                        placeholder="e.g., Casual Leave"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        fullWidth
                        size="small"
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="End Date"
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        fullWidth
                        size="small"
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Reason"
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        fullWidth
                        size="small"
                        multiline
                        rows={1}
                        placeholder="Optional reason"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || !form.leave_type_id || !form.start_date || !form.end_date}
                        sx={{
                          bgcolor: '#4f4b9c',
                          color: '#fff',
                          fontWeight: 600,
                          px: 3,
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          '&:hover': { bgcolor: '#3f3a7c' },
                          '&:disabled': { bgcolor: '#d1d5db', color: '#9ca3af' },
                        }}
                      >
                        {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} /> : null}
                        Request Leave
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>

            {/* Requests Table */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c', mb: 2 }}>
                Your Requests
              </Typography>
              {requests.length > 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb', borderBottom: '2px solid #e7e9ef' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Leave Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Date Range</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2, textAlign: 'center' }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Status</TableCell>
                        {auth.user?.role !== 'Employee' && <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((r) => (
                        <TableRow key={r.id} sx={{ borderBottom: '1px solid #e7e9ef', '&:hover': { bgcolor: '#f9fafb' } }}>
                          <TableCell sx={{ color: '#15162c', fontWeight: 500, py: 2 }}>{r.leave_type_id}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a', py: 2 }}>
                            {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: '#15162c', fontWeight: 500, textAlign: 'center', py: 2 }}>{r.days_requested}</TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              icon={getStatusIcon(r.status)}
                              label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                              sx={{
                                bgcolor: `${getStatusColor(r.status)}15`,
                                color: getStatusColor(r.status),
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          {auth.user?.role !== 'Employee' && (
                            <TableCell sx={{ py: 2 }}>
                              {r.status === 'pending' ? (
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => approve(r.id, true)}
                                    sx={{
                                      bgcolor: '#10b981',
                                      color: '#fff',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      fontSize: '0.8rem',
                                      py: 0.5,
                                      px: 1.5,
                                      borderRadius: 1.5,
                                      '&:hover': { bgcolor: '#059669' },
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => approve(r.id, false)}
                                    sx={{
                                      color: '#ef4444',
                                      borderColor: '#ef4444',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      fontSize: '0.8rem',
                                      py: 0.5,
                                      px: 1.5,
                                      borderRadius: 1.5,
                                      '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </Stack>
                              ) : (
                                <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>-</Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                  <CardContent sx={{ py: 4, textAlign: 'center' }}>
                    <EventAvailableIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>No leave requests yet</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
