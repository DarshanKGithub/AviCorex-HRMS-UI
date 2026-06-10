'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';
import { usePermissions } from '@/components/auth/usePermissions';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { API_BASE_URL } from '@/lib/apiBase';

type Ticket = {
  id: string;
  employee_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
};

export default function HelpdeskPage() {
  const { user, token } = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission('manage_helpdesk');
  
  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [openModal, setOpenModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    void fetchTickets();
  }, [token, isAdmin]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('size', '50');
      if (!isAdmin && employeeId) {
        params.set('employee_id', employeeId);
      }

      const res = await fetch(`${API_BASE_URL}/engagement/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.items || []);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  async function submitTicket() {
    if (!subject || !description) {
      setError('Subject and description are required');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/engagement/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: employeeId,
          subject,
          description,
          category,
          priority
        })
      });

      if (res.ok) {
        setSuccess('Ticket created successfully');
        setOpenModal(false);
        setSubject('');
        setDescription('');
        setCategory('General');
        setPriority('Medium');
        setTimeout(() => fetchTickets(), 500);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to submit ticket');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/engagement/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSuccess(`Ticket status updated to ${newStatus}`);
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        setTimeout(() => fetchTickets(), 500);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to update ticket');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  async function openDetails(ticket: Ticket) {
    setSelectedTicket(ticket);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setCategory(ticket.category);
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setDetailModal(true);
  }

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'Resolved':
      case 'Closed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'In Progress':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'Open':
      default:
        return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  const getPriorityColor = (pr: string) => {
    switch (pr) {
      case 'Critical':
        return { bg: '#fecaca', text: '#7f1d1d' };
      case 'High':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Low':
      default:
        return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupportAgentRoundedIcon color="primary" /> 
          {isAdmin ? 'Request Hub Management' : 'My Request Hub'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setOpenModal(true);
            setSubject('');
            setDescription('');
            setCategory('General');
            setPriority('Medium');
          }}
          sx={{ bgcolor: '#2563EB', borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Create New Ticket
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rounded" height={44} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={12} width="60%" sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
            </Box>
          ) : tickets.length === 0 ? (
            <Card sx={{ borderRadius: 2, boxShadow: 'none' }}>
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <SupportAgentRoundedIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{isAdmin ? 'No tickets yet.' : 'You have not submitted any helpdesk tickets.'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Create the first ticket to get support started.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map(t => (
                  <TableRow key={t.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t.subject}</TableCell>
                    {isAdmin && <TableCell sx={{ fontSize: '0.85rem' }}>{t.employee_id}</TableCell>}
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t.priority} 
                        size="small" 
                        sx={{ 
                          bgcolor: getPriorityColor(t.priority).bg,
                          color: getPriorityColor(t.priority).text,
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: getStatusColor(t.status).bg,
                          color: getStatusColor(t.status).text,
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => openDetails(t)}
                          sx={{ color: '#2563EB' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {isAdmin && t.status !== 'Closed' && (
                          <IconButton
                            size="small"
                            onClick={() => openDetails(t)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Creation Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Raise a Helpdesk Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Subject" 
              fullWidth 
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
            <TextField 
              label="Description" 
              fullWidth 
              multiline 
              rows={4} 
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                select
                label="Category" 
                fullWidth 
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {['General', 'IT', 'HR', 'Payroll', 'Admin'].map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
              <TextField 
                select
                label="Priority" 
                fullWidth 
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                {['Low', 'Medium', 'High', 'Critical'].map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={submitTicket} variant="contained" sx={{ bgcolor: '#2563EB', textTransform: 'none' }}>Submit Ticket</Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={detailModal} onClose={() => setDetailModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ticket Details</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Subject</Typography>
                <Typography sx={{ fontWeight: 500 }}>{selectedTicket.subject}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Description</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Category</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedTicket.category}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Priority</Typography>
                  <Chip 
                    label={selectedTicket.priority}
                    sx={{ 
                      bgcolor: getPriorityColor(selectedTicket.priority).bg,
                      color: getPriorityColor(selectedTicket.priority).text,
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Stack>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>Status</Typography>
                {isAdmin ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Chip
                    label={status}
                    sx={{
                      bgcolor: getStatusColor(status).bg,
                      color: getStatusColor(status).text,
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: '#999' }}>
                Created: {new Date(selectedTicket.created_at).toLocaleString()}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailModal(false)}>Close</Button>
          {isAdmin && selectedTicket && selectedTicket.status !== 'Closed' && (
            <Button
              onClick={() => {
                updateTicketStatus(selectedTicket.id, status);
                setDetailModal(false);
              }}
              variant="contained"
              sx={{ bgcolor: '#2563EB' }}
            >
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
