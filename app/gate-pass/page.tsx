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
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface GatePass {
  id: string;
  employee_id: string;
  category: string;
  reason: string;
  exit_time: string;
  expected_return_time: string;
  status: string;
  approver_id?: string;
  admin_comments?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  items: GatePass[];
  total: number;
  page: number;
  size: number;
}

export default function GatePassPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'Personal Work',
    reason: '',
    exit_time: '',
    expected_return_time: '',
  });

  useEffect(() => {
    if (token) {
      setIsAdmin(['Admin', 'HR'].includes(user?.role || ''));
      fetchGatePasses();
    }
  }, [token, user?.role]);

  async function fetchGatePasses() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/engagement/gatepasses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setGatePasses(data.items);
      }
    } catch (err) {
      setError('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.reason || !formData.exit_time || !formData.expected_return_time) {
      setError('All fields are required');
      return;
    }

    if (new Date(formData.expected_return_time) <= new Date(formData.exit_time)) {
      setError('Return time must be after exit time');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/engagement/gatepasses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: user?.id,
          category: formData.category,
          reason: formData.reason,
          exit_time: new Date(formData.exit_time).toISOString(),
          expected_return_time: new Date(formData.expected_return_time).toISOString(),
        }),
      });

      if (res.ok) {
        setSuccess('Gate pass requested successfully');
        setOpenModal(false);
        setFormData({ category: 'Personal Work', reason: '', exit_time: '', expected_return_time: '' });
        await fetchGatePasses();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to request gate pass');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`${API_BASE}/engagement/gatepasses/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (res.ok) {
        setSuccess('Gate pass approved');
        await fetchGatePasses();
      } else {
        setError('Failed to approve');
      }
    } finally {
      setApproving(null);
    }
  }

  async function handleReject(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`${API_BASE}/engagement/gatepasses/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (res.ok) {
        setSuccess('Gate pass rejected');
        await fetchGatePasses();
      } else {
        setError('Failed to reject');
      }
    } finally {
      setApproving(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#dcfce7', text: '#166534' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'pending':
      default:
        return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BadgeIcon color="primary" />
          {isAdmin ? 'Gate Pass Management' : 'Gate Pass Requests'}
        </Typography>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 600 }}
          >
            Request Gate Pass
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 0 }}>
          {gatePasses.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              {isAdmin ? 'No gate pass requests yet.' : 'You have not requested any gate passes.'}
            </Typography>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date Requested</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Exit Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Return Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {gatePasses.map((gp) => {
                  const colors = getStatusColor(gp.status);
                  return (
                    <TableRow key={gp.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell sx={{ fontSize: '0.9rem' }}>
                        {new Date(gp.created_at).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && <TableCell sx={{ fontSize: '0.85rem' }}>{gp.employee_id}</TableCell>}
                      <TableCell>{gp.category}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>
                        {new Date(gp.exit_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>
                        {new Date(gp.expected_return_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={gp.status}
                          size="small"
                          sx={{
                            bgcolor: colors.bg,
                            color: colors.text,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {gp.status === 'pending' && (
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(gp.id)}
                                disabled={approving === gp.id}
                                sx={{ color: '#10b981' }}
                              >
                                <ThumbUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReject(gp.id)}
                                disabled={approving === gp.id}
                                sx={{ color: '#ef4444' }}
                              >
                                <ThumbDownIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gate Pass Request Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Gate Pass</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Personal Work">Personal Work</option>
              <option value="Medical">Medical</option>
              <option value="Emergency">Emergency</option>
              <option value="Official Work">Official Work</option>
            </TextField>

            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain the reason for your gate pass"
            />

            <TextField
              label="Exit Time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.exit_time}
              onChange={(e) => setFormData({ ...formData, exit_time: e.target.value })}
            />

            <TextField
              label="Expected Return Time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.expected_return_time}
              onChange={(e) => setFormData({ ...formData, expected_return_time: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#7c3aed', textTransform: 'none' }}
          >
            Request Gate Pass
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
