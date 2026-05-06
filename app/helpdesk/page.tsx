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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

export default function HelpdeskPage() {
  const { user, token } = useAuth();
  
  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [openModal, setOpenModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/engagement/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.items || []);
      }
    } catch (e) {
      console.error(e);
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
      const res = await fetch(`${API_BASE}/engagement/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: user?.id,
          subject,
          description,
          category,
          priority
        })
      });

      if (res.ok) {
        setOpenModal(false);
        setSubject('');
        setDescription('');
        setCategory('General');
        setPriority('Medium');
        fetchTickets(); // Refresh
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to submit ticket');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupportAgentRoundedIcon color="primary" /> My Helpdesk Tickets
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Create New Ticket
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Typography sx={{ p: 3, textAlign: 'center' }}>Loading tickets...</Typography>
          ) : tickets.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center', color: '#6b7280' }}>You have not submitted any helpdesk tickets.</Typography>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t.subject}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t.priority} 
                        size="small" 
                        sx={{ 
                          bgcolor: t.priority === 'High' || t.priority === 'Critical' ? '#fee2e2' : '#f3f4f6',
                          color: t.priority === 'High' || t.priority === 'Critical' ? '#991b1b' : '#4b5563',
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: t.status === 'Resolved' || t.status === 'Closed' ? '#dcfce7' : t.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                          color: t.status === 'Resolved' || t.status === 'Closed' ? '#166534' : t.status === 'In Progress' ? '#1e40af' : '#92400e',
                          fontWeight: 600
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

      {/* Ticket Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Raise a Helpdesk Ticket</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
          <Button onClick={submitTicket} variant="contained" sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Submit Ticket</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
