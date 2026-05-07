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
  Tab,
  Tabs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface Grievance {
  id: string;
  employee_id: string;
  against_employee_id?: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface PaginatedResponse {
  items: Grievance[];
  total: number;
  page: number;
  size: number;
}

export default function GrievancePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    against_employee_id: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    if (token) {
      setIsAdmin(['Admin', 'HR'].includes(user?.role));
      fetchGrievances();
    }
  }, [token, user?.role, statusFilter]);

  async function fetchGrievances() {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}/engagement/grievances${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setGrievances(data.items);
      }
    } catch (err) {
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.subject || !formData.description) {
      setError('Subject and description are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/engagement/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          against_employee_id: formData.against_employee_id || null,
          subject: formData.subject,
          description: formData.description,
        }),
      });

      if (res.ok) {
        setSuccess('Grievance filed successfully');
        setOpenModal(false);
        setFormData({ against_employee_id: '', subject: '', description: '' });
        await fetchGrievances();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to file grievance');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  async function openDetails(grievance: Grievance) {
    setSelectedGrievance(grievance);
    setDetailModal(true);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Investigating':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'Submitted':
      default:
        return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    switch (newValue) {
      case 0:
        setStatusFilter(null);
        break;
      case 1:
        setStatusFilter('Submitted');
        break;
      case 2:
        setStatusFilter('Investigating');
        break;
      case 3:
        setStatusFilter('Resolved');
        break;
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="primary" />
          {isAdmin ? 'Grievance Management' : 'My Grievances'}
        </Typography>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none', fontWeight: 600 }}
          >
            File Grievance
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!isAdmin && (
        <Box sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="All" />
            <Tab label="Submitted" />
            <Tab label="Investigating" />
            <Tab label="Resolved" />
          </Tabs>
        </Box>
      )}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 0 }}>
          {grievances.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center', color: '#6b7280' }}>
              {isAdmin ? 'No grievances yet.' : 'You have not filed any grievances.'}
            </Typography>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date Filed</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Against</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grievances.map((g) => {
                  const colors = getStatusColor(g.status);
                  return (
                    <TableRow key={g.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell sx={{ fontSize: '0.9rem' }}>
                        {new Date(g.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{g.subject}</TableCell>
                      {isAdmin && <TableCell sx={{ fontSize: '0.85rem' }}>{g.employee_id}</TableCell>}
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {g.against_employee_id || 'General'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={g.status}
                          size="small"
                          sx={{
                            bgcolor: colors.bg,
                            color: colors.text,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openDetails(g)}
                          sx={{ color: '#3b82f6' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* File Grievance Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>File a Grievance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Against Employee ID (Optional)"
              fullWidth
              value={formData.against_employee_id}
              onChange={(e) => setFormData({ ...formData, against_employee_id: e.target.value })}
              placeholder="Employee ID if grievance is against someone"
              helperText="Leave blank for general grievances"
            />
            <TextField
              label="Subject"
              fullWidth
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief subject of your grievance"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the grievance..."
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
            File Grievance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grievance Details Modal */}
      <Dialog open={detailModal} onClose={() => setDetailModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Grievance Details</DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Subject</Typography>
                <Typography sx={{ fontWeight: 500 }}>{selectedGrievance.subject}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Description</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>
                  {selectedGrievance.description}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Status</Typography>
                  <Chip
                    label={selectedGrievance.status}
                    sx={{
                      bgcolor: getStatusColor(selectedGrievance.status).bg,
                      color: getStatusColor(selectedGrievance.status).text,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                {selectedGrievance.against_employee_id && (
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Against</Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {selectedGrievance.against_employee_id}
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Box sx={{ fontSize: '0.75rem', color: '#999' }}>
                Filed: {new Date(selectedGrievance.created_at).toLocaleString()}
                {selectedGrievance.updated_at && (
                  <>
                    <br />
                    Updated: {new Date(selectedGrievance.updated_at).toLocaleString()}
                  </>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
