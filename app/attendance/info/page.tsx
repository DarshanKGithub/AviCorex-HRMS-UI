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
import CircularProgress from '@mui/material/CircularProgress';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import RuleIcon from '@mui/icons-material/Rule';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};


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
      if (subTab === 'history') statusFilter = 'Approved'; 
      
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <RuleIcon sx={{ color: '#6366f1' }} /> 
          Regularizations & Adjustments
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setTab(1)}
          sx={{ 
            bgcolor: '#6366f1', 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 700,
            px: 3,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            display: tab === 0 ? 'block' : 'none',
            '&:hover': {
              bgcolor: '#4f46e5'
            }
          }}
        >
          My Adjustments
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: '#f1f5f9', mb: 4 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{
            '& .MuiTabs-indicator': {
              bgcolor: '#6366f1',
              height: 3,
              borderRadius: 3
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#64748b',
              py: 1.5,
              '&.Mui-selected': {
                color: '#6366f1',
              },
            },
          }}
        >
          <Tab label="Attendance Info" />
          <Tab label="My Adjustments" />
        </Tabs>
      </Box>

      {/* TABS CONTENT */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
              <Card sx={commonCardStyles}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '0.05em' }}>Avg. Work Hrs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#6366f1' }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={commonCardStyles}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '0.05em' }}>Avg. Actual Hrs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={commonCardStyles}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '0.05em' }}>Penalty Days</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>0</Typography>
                </CardContent>
              </Card>
            </Stack>

            <Card sx={{ ...commonCardStyles, p: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.04)' }}>
              <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <Button sx={{ minWidth: 'auto', p: 1, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{'<'} Prev</Typography>
                </Button>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '0.02em' }}>MAY 2026</Typography>
                <Button sx={{ minWidth: 'auto', p: 1, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Next {'>'}</Typography>
                </Button>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Box key={day} sx={{ py: 1.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: '#ffffff' }}>
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = ((i + 26) % 31) + 1;
                  const isCurrentMonth = i >= 4 && i < 35; // Rough approximation for visual testing
                  const hasData = i === 7;
                  
                  return (
                    <Box 
                      key={i} 
                      sx={{ 
                        borderRight: (i + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none',
                        borderBottom: i < 28 ? '1px solid #f1f5f9' : 'none',
                        minHeight: 110, 
                        p: 1.5, 
                        position: 'relative', 
                        bgcolor: isCurrentMonth ? '#ffffff' : '#fafbfd',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: isCurrentMonth ? '#fdfdff' : '#fafbfd',
                          boxShadow: isCurrentMonth ? 'inset 0 0 0 1px #e2e8f0' : 'none'
                        } 
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography sx={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 700, 
                          color: isCurrentMonth ? '#334155' : '#cbd5e1' 
                        }}>
                          {dayNum}
                        </Typography>
                      </Box>
                      
                      {hasData && (
                        <Box sx={{ 
                          mt: 1.5,
                          width: '100%',
                          py: 0.8, 
                          px: 1,
                          borderRadius: 1.5, 
                          bgcolor: 'rgba(99, 102, 241, 0.08)', 
                          color: '#4f46e5', 
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(99, 102, 241, 0.12)',
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                          }
                        }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Absent (0)</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, mb: 1 }}>03 SUN</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem', mb: 1 }}>General (GEN)</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, mb: 4 }}>Shift : 09:00 to 18:00</Typography>
                
                <Divider sx={{ my: 3, borderColor: '#f1f5f9' }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>First In</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>-</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Last Out</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>-</Typography>
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
              <Card sx={commonCardStyles}>
                  <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                          <Typography sx={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 700, '&:hover': { color: '#6366f1' } }}>{'<'} Prev</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>MAY 2026</Typography>
                          <Typography sx={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 700, '&:hover': { color: '#6366f1' } }}>Next {'>'}</Typography>
                      </Stack>
                      <Box sx={{ bgcolor: '#f8fafc', p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>No exception days to regularise for this month.</Typography>
                      </Box>
                  </CardContent>
              </Card>
           </Grid>
           <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ bgcolor: '#f8fafc', p: 0.5, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                      <Button variant={subTab === 'apply' ? 'contained' : 'text'} onClick={() => setSubTab('apply')} sx={{ bgcolor: subTab === 'apply' ? '#ffffff' : 'transparent', boxShadow: subTab === 'apply' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', borderRadius: 1.5, textTransform: 'none', color: subTab === 'apply' ? '#6366f1' : '#64748b', fontWeight: 700, px: 3 }}>Apply</Button>
                      <Button variant={subTab === 'pending' ? 'contained' : 'text'} onClick={() => setSubTab('pending')} sx={{ bgcolor: subTab === 'pending' ? '#ffffff' : 'transparent', boxShadow: subTab === 'pending' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', borderRadius: 1.5, textTransform: 'none', color: subTab === 'pending' ? '#6366f1' : '#64748b', fontWeight: 700, px: 3 }}>Pending</Button>
                      <Button variant={subTab === 'history' ? 'contained' : 'text'} onClick={() => setSubTab('history')} sx={{ bgcolor: subTab === 'history' ? '#ffffff' : 'transparent', boxShadow: subTab === 'history' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', borderRadius: 1.5, textTransform: 'none', color: subTab === 'history' ? '#6366f1' : '#64748b', fontWeight: 700, px: 3 }}>History</Button>
                  </Stack>
              </Box>

              {subTab === 'apply' ? (
                <Card sx={{ ...commonCardStyles, p: 4 }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <ManageHistoryIcon sx={{ fontSize: 64, color: '#6366f1', mb: 3, opacity: 0.2 }} />
                        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 1 }}>Need to adjust an Absent mark?</Typography>
                        <Typography sx={{ fontSize: '1rem', color: '#64748b', mb: 4, maxWidth: 400, mx: 'auto' }}>
                          Missed a punch, system glitch, or marked absent incorrectly? Submit a regularization request to correct your records.
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={() => setOpenModal(true)} 
                          sx={{ 
                            textTransform: 'none', 
                            borderRadius: 2, 
                            bgcolor: '#6366f1', 
                            fontWeight: 700, 
                            px: 4, 
                            py: 1.5,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' 
                          }}
                        >
                          New Regularization
                        </Button>
                    </CardContent>
                </Card>
              ) : (
                <Card sx={commonCardStyles}>
                  <CardContent sx={{ p: 0 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#6366f1' }} />
                      </Box>
                    ) : regularizations.length === 0 ? (
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <InsightsRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                        <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>No {subTab} regularizations found</Typography>
                      </Box>
                    ) : (
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Requested In/Out</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {regularizations.map(reg => {
                            const colors = getStatusColor(reg.status);
                            return (
                              <TableRow key={reg.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9', py: 2.5 } }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{reg.date}</TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{reg.reason}</TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                  {reg.requested_check_in ? new Date(reg.requested_check_in).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'} 
                                  {' / '} 
                                  {reg.requested_check_out ? new Date(reg.requested_check_out).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={reg.status} 
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
                    )}
                  </CardContent>
                </Card>
              )}
           </Grid>
        </Grid>
      )}

      {/* Regularization Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.25rem' }}>Apply Regularization</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              value={regDate}
              onChange={e => setRegDate(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
            <TextField 
              label="Reason for Adjustment" 
              fullWidth 
              multiline 
              rows={3} 
              value={regReason}
              onChange={e => setRegReason(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafbfd'
                }
              }}
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Requested Check-In (Optional)" 
                type="time" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={regCheckIn}
                onChange={e => setRegCheckIn(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#fafbfd'
                  }
                }}
              />
              <TextField 
                label="Requested Check-Out (Optional)" 
                type="time" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={regCheckOut}
                onChange={e => setRegCheckOut(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#fafbfd'
                  }
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>Cancel</Button>
          <Button onClick={submitRegularization} variant="contained" sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#4f46e5' } }}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
