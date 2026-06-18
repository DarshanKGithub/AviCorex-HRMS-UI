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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
    switch (status.toLowerCase()) {
      case 'draft':
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

  const totalHoursLogged = timesheets.reduce((acc, curr) => acc + curr.hours_worked, 0);
  const pendingApprovals = timesheets.filter(ts => ts.status.toLowerCase() === 'draft' || ts.status.toLowerCase() === 'pending').length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ color: '#6366f1' }} /> 
          Timesheets
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
          New Timesheet
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Logs</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#6366f1' }}>{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Hours Logged</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#10b981' }}>{totalHoursLogged.toFixed(1)}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approvals</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#f59e0b' }}>{pendingApprovals}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      <Card sx={commonCardStyles}>
        <CardContent sx={{ p: 0 }}>
          {loading && timesheets.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : timesheets.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>No timesheets found</Typography>
              <Typography sx={{ color: '#64748b' }}>Click 'New Timesheet' to log your hours.</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Task Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timesheets.map((ts) => {
                    const colors = getStatusColor(ts.status);
                    return (
                      <TableRow key={ts.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9', py: 2.5 } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{new Date(ts.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ maxWidth: 300, color: '#475569', fontWeight: 500 }}>{ts.task_description}</TableCell>
                        <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{ts.project_id || '-'}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{ts.hours_worked}h</TableCell>
                        <TableCell>
                          <Chip
                            label={ts.status}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.text,
                              fontWeight: 700,
                              px: 1
                            }}
                          />
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
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.25rem' }}>Log Hours</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
            <TextField
              label="Project ID (Optional)"
              fullWidth
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
            <TextField
              label="Task Description"
              fullWidth
              multiline
              rows={3}
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
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
            Create Timesheet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
