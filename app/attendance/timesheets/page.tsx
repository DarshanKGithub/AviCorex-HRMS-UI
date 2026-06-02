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
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface Timesheet {
  id: string;
  employee_id: string;
  date: string;
  project_id?: string;
  task_description: string;
  hours_worked: number;
  status: string;
  approver_id?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  items: Timesheet[];
  total: number;
  page: number;
  size: number;
}

export default function TimesheetsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    task_description: '',
    hours_worked: '',
    project_id: '',
  });

  useEffect(() => {
    if (token) {
      fetchTimesheets();
    }
  }, [token, page]);

  async function fetchTimesheets() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/timesheets?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setTimesheets(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      setError('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.date || !formData.task_description || !formData.hours_worked) {
      setError('Please fill all required fields');
      return;
    }

    const hours = parseFloat(formData.hours_worked);
    if (isNaN(hours) || hours < 0) {
      setError('Hours cannot be negative');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/timesheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: user?.id,
          date: formData.date,
          task_description: formData.task_description,
          hours_worked: parseFloat(formData.hours_worked),
          project_id: formData.project_id || null,
        }),
      });

      if (res.ok) {
        setSuccess('Timesheet created successfully');
        setOpenModal(false);
        setFormData({ date: '', task_description: '', hours_worked: '', project_id: '' });
        await fetchTimesheets();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to create timesheet');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return '#f59e0b';
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading && timesheets.length === 0) {
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Timesheets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 600 }}
        >
          New Timesheet
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Task Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No timesheets found
                  </TableCell>
                </TableRow>
              ) : (
                timesheets.map((ts) => (
                  <TableRow key={ts.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                    <TableCell>{new Date(ts.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{ts.task_description}</TableCell>
                    <TableCell>{ts.hours_worked}h</TableCell>
                    <TableCell>{ts.project_id || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={ts.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(ts.status),
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Timesheet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <TextField
              label="Task Description"
              fullWidth
              multiline
              rows={3}
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
            />
            <TextField
              label="Hours Worked"
              type="number"
              inputProps={{ step: 0.5, min: 0 }}
              fullWidth
              value={formData.hours_worked}
              onChange={(e) => {
                const val = e.target.value;
                if (!val.includes('-')) {
                  setFormData({ ...formData, hours_worked: val });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault();
                }
              }}
            />
            <TextField
              label="Project ID (Optional)"
              fullWidth
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
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
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
