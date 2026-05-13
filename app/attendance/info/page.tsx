'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Regularization = {
  id: string;
  date: string;
  reason: string;
  status: string;
  requested_check_in: string | null;
  requested_check_out: string | null;
  created_at: string;
};

export default function AttendanceInfoPage() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [subTab, setSubTab] = useState<'apply' | 'pending' | 'history'>('apply');
  
  // Regularization State
  const [regularizations, setRegularizations] = useState<Regularization[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [openModal, setOpenModal] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 1 && token) {
      fetchRegularizations();
    }
  }, [tab, token, subTab]);

  async function fetchRegularizations() {
    setLoading(true);
    try {
      let statusFilter = '';
      if (subTab === 'pending') statusFilter = 'Pending';
      if (subTab === 'history') statusFilter = 'Approved'; // Simply filter approved for history demo
      
      const res = await fetch(`${API_BASE}/advanced-attendance/regularizations?status_filter=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegularizations(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function submitRegularization() {
    if (!regDate || !regReason) {
      setError('Date and reason are required');
      return;
    }
    
    // Convert to proper ISO if checkin/checkout provided
    const checkInISO = regCheckIn ? new Date(`${regDate}T${regCheckIn}:00Z`).toISOString() : null;
    const checkOutISO = regCheckOut ? new Date(`${regDate}T${regCheckOut}:00Z`).toISOString() : null;

    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/regularizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: user?.id,
          date: regDate,
          reason: regReason,
          requested_check_in: checkInISO,
          requested_check_out: checkOutISO
        })
      });

      if (res.ok) {
        setOpenModal(false);
        setRegDate('');
        setRegReason('');
        setRegCheckIn('');
        setRegCheckOut('');
        setSubTab('pending'); // switch to pending to see it
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to submit request');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {tab === 0 ? 'Attendance Info' : 'Attendance Info / My Regularizations'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setTab(1)}
          sx={{ 
            bgcolor: '#7c3aed', 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            px: 3,
            display: tab === 0 ? 'block' : 'none'
          }}
        >
          My Regularizations
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Attendance Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="My Regularizations" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* TABS CONTENT */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Avg. Work Hrs</Typography>
                  <Typography sx={{ fontWeight: 600 }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Avg. Actual Work Hrs</Typography>
                  <Typography sx={{ fontWeight: 600 }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Penalty Days</Typography>
                  <Typography sx={{ fontWeight: 600 }}>0</Typography>
                </CardContent>
              </Card>
            </Stack>

            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography sx={{ color: 'text.secondary', cursor: 'pointer' }}>{'<'} Prev</Typography>
                  <Typography sx={{ fontWeight: 600 }}>May 2026</Typography>
                  <Typography sx={{ color: 'text.secondary', cursor: 'pointer' }}>Next {'>'}</Typography>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', color: 'text.secondary', fontSize: '0.85rem', mb: 1 }}>
                  <Box>Sun</Box><Box>Mon</Box><Box>Tue</Box><Box>Wed</Box><Box>Thu</Box><Box>Fri</Box><Box>Sat</Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Box key={i} sx={{ border: '1px solid #e5e7eb', height: 80, borderRadius: 1, p: 1, position: 'relative' }}>
                      <Typography sx={{ fontSize: '0.85rem' }}>{((i + 26) % 31) + 1}</Typography>
                      {i === 7 && <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, borderRadius: '50%', border: '2px solid #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>0</Box>}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>03 Sun</Typography>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>General(GEN)</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 3 }}>Shift : 09:00 to 18:00</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>First In</Typography>
                    <Typography>-</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Last Out</Typography>
                    <Typography>-</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
           <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                          <Typography sx={{ color: 'text.secondary', cursor: 'pointer' }}>{'<'} Prev</Typography>
                          <Typography sx={{ fontWeight: 600 }}>MAY 2026</Typography>
                          <Typography sx={{ color: 'text.secondary', cursor: 'pointer' }}>Next {'>'}</Typography>
                      </Stack>
                      <Box sx={{ bgcolor: '#f3f4f6', p: 2, textAlign: 'center', borderRadius: 1 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>No exception days to regularise.</Typography>
                      </Box>
                  </CardContent>
              </Card>
           </Grid>
           <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Stack direction="row" spacing={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
                      <Button variant={subTab === 'apply' ? 'contained' : 'text'} onClick={() => setSubTab('apply')} sx={{ bgcolor: subTab === 'apply' ? '#7c3aed' : 'transparent', borderRadius: 0, textTransform: 'none', color: subTab === 'apply' ? '#fff' : '#6b7280' }}>Apply</Button>
                      <Button variant={subTab === 'pending' ? 'contained' : 'text'} onClick={() => setSubTab('pending')} sx={{ bgcolor: subTab === 'pending' ? '#7c3aed' : 'transparent', borderRadius: 0, textTransform: 'none', color: subTab === 'pending' ? '#fff' : '#6b7280' }}>Pending</Button>
                      <Button variant={subTab === 'history' ? 'contained' : 'text'} onClick={() => setSubTab('history')} sx={{ bgcolor: subTab === 'history' ? '#7c3aed' : 'transparent', borderRadius: 0, textTransform: 'none', color: subTab === 'history' ? '#fff' : '#6b7280' }}>History</Button>
                  </Stack>
              </Box>

              {subTab === 'apply' ? (
                <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', py: 8 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: 'text.secondary', mb: 1 }}>Smart! Your attendance is sorted.</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mb: 3 }}>Still want to apply regularization? Select date(s).</Typography>
                        <Button variant="outlined" onClick={() => setOpenModal(true)} sx={{ textTransform: 'none', borderRadius: 2 }}>New Regularization</Button>
                    </CardContent>
                </Card>
              ) : (
                <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 0 }}>
                    {loading ? (
                      <Typography sx={{ p: 3, textAlign: 'center' }}>Loading...</Typography>
                    ) : regularizations.length === 0 ? (
                      <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No {subTab} regularizations found.</Typography>
                    ) : (
                      <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Requested In/Out</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {regularizations.map(reg => (
                            <TableRow key={reg.id}>
                              <TableCell>{reg.date}</TableCell>
                              <TableCell>{reg.reason}</TableCell>
                              <TableCell>
                                {reg.requested_check_in ? new Date(reg.requested_check_in).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'} 
                                {' / '} 
                                {reg.requested_check_out ? new Date(reg.requested_check_out).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={reg.status} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: reg.status === 'Approved' ? '#dcfce7' : reg.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                    color: reg.status === 'Approved' ? '#166534' : reg.status === 'Rejected' ? '#991b1b' : '#92400e',
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
              )}
           </Grid>
        </Grid>
      )}

      {/* Regularization Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Apply Regularization</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              value={regDate}
              onChange={e => setRegDate(e.target.value)}
            />
            <TextField 
              label="Reason" 
              fullWidth 
              multiline 
              rows={3} 
              value={regReason}
              onChange={e => setRegReason(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Requested Check-In (Optional)" 
                type="time" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={regCheckIn}
                onChange={e => setRegCheckIn(e.target.value)}
              />
              <TextField 
                label="Requested Check-Out (Optional)" 
                type="time" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={regCheckOut}
                onChange={e => setRegCheckOut(e.target.value)}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={submitRegularization} variant="contained" sx={{ bgcolor: '#7c3aed', textTransform: 'none' }}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
