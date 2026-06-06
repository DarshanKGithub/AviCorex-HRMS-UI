'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PinDropIcon from '@mui/icons-material/PinDrop';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
};


type AttendanceRecord = {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  is_late: boolean;
  late_minutes: number;
  is_half_day: boolean;
  is_work_from_home: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PaginatedResponse = {
  items: AttendanceRecord[];
  total: number;
  page: number;
  size: number;
};

export default function AttendancePage() {
  const auth = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [checking, setChecking] = useState(false);
  const canMarkAttendance = hasPermission('view_attendance_own') || hasPermission('manage_attendance_records');

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchTodayAttendance();
      fetchRecentRecords();
    }
  }, [auth.status, auth.token, router]);

  async function fetchTodayAttendance() {
    if (!auth.token || !auth.user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const empId = employeeId;
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${empId}&start_date=${today}&end_date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as PaginatedResponse;
        if (data.items.length > 0) {
          setTodayAttendance(data.items[0]);
        }
      }
      setLoading(false);
    } catch {
      setError('Failed to fetch today attendance');
      setLoading(false);
    }
  }

  async function fetchRecentRecords() {
    if (!auth.token || !auth.user) return;

    try {
      const empId = employeeId;
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${empId}&page=1&size=31`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as PaginatedResponse;
        setRecentRecords(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch recent records:', err);
    }
  }

  async function handleCheckIn() {
    if (!auth.token || !auth.user) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const empId = employeeId;
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          employee_id: empId,
          attendance_date: today,
          check_in_time: now,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
        setSuccess(data.is_late ? `Checked in at ${new Date(data.check_in_time).toLocaleTimeString()} (Late by ${data.late_minutes} minutes)` : 'Checked in successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to check in');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setChecking(false);
    }
  }

  async function handleGeoCheckIn() {
    if (!auth.token || !auth.user) return;
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setChecking(true);
    setError(null);
    setSuccess(null);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`${API_BASE_URL}/advanced-attendance/geo-attendance/check-in?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          fetchTodayAttendance(); // Refresh to get the full record
          setSuccess('Geo-Location Check in successful!');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const error = await response.json();
          setError(error.detail || 'Failed to check in');
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setChecking(false);
      }
    }, (err) => {
      setError('Failed to get location: ' + err.message);
      setChecking(false);
    });
  }

  async function handleCheckOut() {
    if (!auth.token || !auth.user || !todayAttendance) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const empId = employeeId;
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          employee_id: empId,
          attendance_date: today,
          check_out_time: now,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
        setSuccess(data.is_half_day ? 'Checked out - Half day marked' : 'Checked out successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to check out');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setChecking(false);
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'absent':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'half-day':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'work-from-home':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
    }
  };

  const attendanceStats = [
    { label: 'Today status', value: todayAttendance?.status ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 'Pending', accent: '#6366f1' },
    { label: 'Check-in', value: todayAttendance ? formatTime(todayAttendance.check_in_time) : '—', accent: '#10b981' },
    { label: 'Check-out', value: todayAttendance ? formatTime(todayAttendance.check_out_time) : '—', accent: '#f59e0b' },
  ];

  if (auth.status === 'loading' || loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6fc', p: { xs: 2, md: 4 } }}>
        <Box sx={{ mx: 'auto', maxWidth: 1120 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 4 }} />
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={4} key={item}>
                  <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
              </Grid>
            </Grid>
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FingerprintIcon sx={{ color: '#6366f1' }} /> 
          Attendance Dashboard
        </Typography>
      </Stack>

      <Stack spacing={4}>
        {/* Soft UI Hero Banner */}
        <Card sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          bgcolor: '#ffffff', 
          border: 'none', 
          boxShadow: '0 4px 24px rgba(99, 102, 241, 0.08)',
          position: 'relative'
        }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0) 100%)' }} />
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <Box sx={{ maxWidth: 720 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', mb: 1 }}>
                  Good morning, let's get to work!
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500, maxWidth: 600 }}>
                  Log your hours, check your shifts, and view actionable AI insights directly from your command center.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: '#6366f1 !important' }} />} label="Live Sync Active" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 700 }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Top KPIs */}
        <Grid container spacing={3}>
          {attendanceStats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card sx={{ ...commonCardStyles, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: stat.accent }}>{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        {!canMarkAttendance && <Alert severity="warning" sx={{ borderRadius: 2 }}>You do not have permission to mark attendance.</Alert>}
        {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

        {/* Action Cards (Check-In / Check-Out) */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '1.1rem' }}>Check In</Typography>
                  <FingerprintIcon sx={{ color: '#10b981', opacity: 0.2, fontSize: 32 }} />
                </Box>
                
                {todayAttendance?.check_in_time ? (
                  <Stack spacing={1.5} sx={{ mb: 4, flex: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>
                      {formatTime(todayAttendance.check_in_time)}
                    </Typography>
                    {todayAttendance.is_late && (
                      <Chip
                        label={`Late by ${todayAttendance.late_minutes} min`}
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 'fit-content', fontWeight: 700 }}
                      />
                    )}
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                      {formatDate(todayAttendance.attendance_date)}
                    </Typography>
                  </Stack>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500 }}>Ready to start your day?</Typography>
                  </Box>
                )}
                
                <Stack spacing={2} sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    onClick={handleCheckIn}
                    disabled={checking || !!todayAttendance?.check_in_time || !canMarkAttendance}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: '#10b981', 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                      '&:hover': { bgcolor: '#059669' }
                    }}
                    fullWidth
                  >
                    {checking ? 'Processing...' : 'Mark Check In (Network)'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PinDropIcon />}
                    onClick={handleGeoCheckIn}
                    disabled={checking || !!todayAttendance?.check_in_time || !canMarkAttendance}
                    sx={{ 
                      py: 1.2, 
                      borderRadius: 2, 
                      borderColor: '#e2e8f0', 
                      color: '#475569', 
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                    }}
                    fullWidth
                  >
                    Geo-Location Check In (GPS)
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '1.1rem' }}>Check Out</Typography>
                  <LogoutIcon sx={{ color: '#ef4444', opacity: 0.2, fontSize: 32 }} />
                </Box>
                
                {todayAttendance?.check_out_time ? (
                  <Stack spacing={1.5} sx={{ mb: 4, flex: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#ef4444', letterSpacing: '-0.02em' }}>
                      {formatTime(todayAttendance.check_out_time)}
                    </Typography>
                    {todayAttendance.is_half_day && (
                      <Chip
                        label="Half Day Marked"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 'fit-content', fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500 }}>You are currently punched in.</Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    onClick={handleCheckOut}
                    disabled={checking || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time || !canMarkAttendance}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: '#ef4444', 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      '&:hover': { bgcolor: '#dc2626' }
                    }}
                    fullWidth
                  >
                    {checking ? 'Processing...' : 'Mark Check Out'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Attendance Table */}
        <Card sx={commonCardStyles}>
          <CardContent sx={{ p: 4, pb: '32px !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>
              Monthly Attendance Log
            </Typography>

            {recentRecords.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid #f1f5f9', py: 2 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Check In</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Check Out</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', align: 'right' }}>Late</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRecords.map((record) => {
                      const colors = getStatusColor(record.status);
                      return (
                        <TableRow key={record.id} sx={{ '& td': { borderBottom: '1px solid #f8fafc', py: 2.5 } }}>
                          <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{formatDate(record.attendance_date)}</TableCell>
                          <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{formatTime(record.check_in_time)}</TableCell>
                          <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{formatTime(record.check_out_time)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              size="small"
                              sx={{
                                bgcolor: colors.bg,
                                color: colors.text,
                                fontWeight: 700,
                                px: 1
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {record.is_late ? `${record.late_minutes} min` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <InsightsRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>No attendance records found</Typography>
                <Typography sx={{ color: '#64748b' }}>Check in to populate your timeline and attendance analytics.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
