"use client";

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import ClockIcon from '@mui/icons-material/Schedule';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Shift = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ShiftListResponse = {
  items: Shift[];
  total: number;
  page: number;
  size: number;
};

export default function ShiftsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '09:00',
    end_time: '18:00',
    grace_period_minutes: 5,
  });

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      // Check if user has admin/HR role
      if (auth.user?.role !== 'admin' && auth.user?.role !== 'hr') {
        router.push('/attendance');
      } else {
        fetchShifts();
      }
    }
  }, [auth.status, auth.token, router, auth.user?.role]);

  async function fetchShifts() {
    if (!auth.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/shifts?page=1&size=50`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as ShiftListResponse;
        setShifts(data.items);
      } else {
        setError('Failed to fetch shifts');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateShift() {
    if (!auth.token) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newShift = await response.json();
        setShifts([...shifts, newShift]);
        setSuccess('Shift created successfully!');
        setOpenDialog(false);
        setFormData({
          name: '',
          start_time: '09:00',
          end_time: '18:00',
          grace_period_minutes: 5,
        });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to create shift');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setCreating(false);
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Handle both HH:MM format and full timestamp format
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return timeString;
  };

  if (auth.status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <Box className="mx-auto max-w-4xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box className="rounded-[28px] border border-line/70 bg-white/85 px-6 py-6 shadow-soft backdrop-blur-sm">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <Box>
                <Chip
                  icon={<ClockIcon sx={{ color: '#4f4b9c !important' }} />}
                  label="Shift Management"
                  sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800 }}
                />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
                  Manage Shifts
                </Typography>
                <Typography sx={{ mt: 0.8, color: '#5b5f7a' }}>
                  Create and manage work shifts for your organization.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Create Shift
              </Button>
            </Stack>
          </Box>

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Success Alert */}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Shifts Table */}
          <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef' }}>
            <CardContent>
              {shifts.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Shift Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Start Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>End Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Grace Period</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shifts.map((shift) => (
                        <TableRow key={shift.id} sx={{ '&:hover': { bgcolor: '#f8f9fb' } }}>
                          <TableCell sx={{ color: '#5b5f7a' }}>{shift.name}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>{formatTime(shift.start_time)}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>{formatTime(shift.end_time)}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>{shift.grace_period_minutes} min</TableCell>
                          <TableCell>
                            <Chip
                              label={shift.is_active ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                bgcolor: shift.is_active ? 'rgba(76, 175, 80, 0.16)' : 'rgba(158, 158, 158, 0.16)',
                                color: shift.is_active ? '#4caf50' : '#9e9e9e',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Alert severity="info">No shifts created yet. Create your first shift!</Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Create Shift Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Shift</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Shift Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Shift"
              fullWidth
            />
            <TextField
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Grace Period (minutes)"
              type="number"
              value={formData.grace_period_minutes}
              onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateShift}
            variant="contained"
            disabled={!formData.name || creating}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
