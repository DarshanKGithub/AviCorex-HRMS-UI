"use client";

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';

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
                  icon={<ScheduleIcon sx={{ color: '#4f4b9c !important' }} />}
                  label="Attendance"
                  sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800 }}
                />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
                  Check-in / Check-out
                </Typography>
                <Typography sx={{ mt: 0.8, color: '#5b5f7a' }}>
                  Record your daily attendance with accurate timestamps and status tracking.
                </Typography>
              </Box>
            </Stack>
          </Box>

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
                    {checking ? 'Checking in...' : 'Check In'}
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
                <Alert severity="info">No attendance records yet. Check in to get started!</Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
