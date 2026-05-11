"use client";

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
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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
      const empId = (auth.user as any).employee_id || auth.user.id;
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
      const empId = (auth.user as any).employee_id || auth.user.id;
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${empId}&page=1&size=10`,
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

      const empId = (auth.user as any).employee_id || auth.user.id;
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

      const empId = (auth.user as any).employee_id || auth.user.id;
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
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#4caf50';
      case 'absent':
        return '#f44336';
      case 'half-day':
        return '#ff9800';
      case 'work-from-home':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  const attendanceStats = [
    { label: 'Today status', value: todayAttendance?.status || 'Pending', accent: '#3b82f6' },
    { label: 'Check-in', value: todayAttendance ? formatTime(todayAttendance.check_in_time) : '—', accent: '#10b981' },
    { label: 'Check-out', value: todayAttendance ? formatTime(todayAttendance.check_out_time) : '—', accent: '#f97316' },
  ];

  if (auth.status === 'loading' || loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
        <Box sx={{ mx: 'auto', maxWidth: 1120 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 5 }} />
            <Grid container spacing={2.5}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} lg={3} key={item}>
                  <Skeleton variant="rounded" height={128} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={2.5}>
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
    <Box className="min-h-screen bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <Box className="mx-auto max-w-5xl">
        <Breadcrumbs />
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 5, overflow: 'hidden', bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px -24px rgba(15,23,42,0.45)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 22%), radial-gradient(circle at bottom left, rgba(139,92,246,0.12), transparent 25%)' }} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
                <Box sx={{ maxWidth: 720 }}>
                  <Chip
                    icon={<ScheduleIcon sx={{ color: '#93c5fd !important' }} />}
                    label="Attendance Command Center"
                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                  <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                    Check-in / Check-out with a premium, AI-friendly flow.
                  </Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(226,232,240,0.78)', maxWidth: 600 }}>
                    View your shift status, see insights in context, and keep every attendance action calm and easy to scan.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: '#93c5fd !important' }} />} label="Live sync" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                  <Chip icon={<InsightsRoundedIcon sx={{ color: '#86efac !important' }} />} label="AI signals" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            {attendanceStats.map((stat) => (
              <Grid item xs={12} sm={4} key={stat.label}>
                <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                  <CardContent>
                    <Typography sx={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>{stat.label}</Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, color: stat.accent }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {!canMarkAttendance && <Alert severity="warning">You do not have permission to mark attendance.</Alert>}

          {/* Success Alert */}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Today's Check-in/Check-out */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#5b5f7a', fontWeight: 700, mb: 2 }}>Check In</Typography>
                  {todayAttendance?.check_in_time ? (
                    <Stack spacing={1.5}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#4caf50' }}>
                        {formatTime(todayAttendance.check_in_time)}
                      </Typography>
                      {todayAttendance.is_late && (
                        <Chip
                          label={`Late by ${todayAttendance.late_minutes} min`}
                          sx={{ bgcolor: 'rgba(255, 152, 0, 0.16)', color: '#ff9800', width: 'fit-content' }}
                        />
                      )}
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>
                        {formatDate(todayAttendance.attendance_date)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: '#9e9e9e', mb: 2 }}>No check-in yet</Typography>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleCheckIn}
                    disabled={checking || !!todayAttendance?.check_in_time || !canMarkAttendance}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {checking ? 'Checking in...' : 'Check In (Network)'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleGeoCheckIn}
                    disabled={checking || !!todayAttendance?.check_in_time || !canMarkAttendance}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    Geo-Location Check In (GPS)
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#5b5f7a', fontWeight: 700, mb: 2 }}>Check Out</Typography>
                  {todayAttendance?.check_out_time ? (
                    <Stack spacing={1.5}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#f44336' }}>
                        {formatTime(todayAttendance.check_out_time)}
                      </Typography>
                      {todayAttendance.is_half_day && (
                        <Chip
                          label="Half Day"
                          sx={{ bgcolor: 'rgba(255, 193, 7, 0.16)', color: '#ffc107', width: 'fit-content' }}
                        />
                      )}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: '#9e9e9e', mb: 2 }}>No check-out yet</Typography>
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    disabled={checking || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time || !canMarkAttendance}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {checking ? 'Checking out...' : 'Check Out'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Attendance Records */}
          <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#15162c', mb: 2 }}>
                Recent Attendance
              </Typography>

              {recentRecords.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Check In</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Check Out</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Late</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRecords.map((record) => (
                        <TableRow key={record.id} sx={{ '&:hover': { bgcolor: '#f8f9fb' } }}>
                          <TableCell sx={{ color: '#5b5f7a' }}>{formatDate(record.attendance_date)}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>{formatTime(record.check_in_time)}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>{formatTime(record.check_out_time)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(record.status)}20`,
                                color: getStatusColor(record.status),
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#5b5f7a' }}>
                            {record.is_late ? `${record.late_minutes} min` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                  <CardContent sx={{ py: 5, textAlign: 'center' }}>
                    <InsightsRoundedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1.5 }} />
                    <Typography sx={{ color: '#15162c', fontWeight: 800, mb: 0.5 }}>No attendance records yet</Typography>
                    <Typography sx={{ color: '#64748b' }}>Check in to populate your timeline and attendance analytics.</Typography>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
