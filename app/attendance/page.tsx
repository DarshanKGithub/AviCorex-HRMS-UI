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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
  status?: string;
  is_late: boolean;
  late_minutes: number;
  is_half_day: boolean;
  is_work_from_home: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type PaginatedResponse = {
  items: AttendanceRecord[];
  total: number;
  page: number;
  size: number;
};

type AttendanceSummary = {
  employee_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  work_from_home_days: number;
  late_days: number;
  records: Array<{
    date: string;
    status: string;
    check_in_time: string | null;
    check_out_time: string | null;
    is_late: boolean;
    is_half_day: boolean;
    is_work_from_home: boolean;
  }>;
};

export default function AttendancePage() {
  const auth = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [checking, setChecking] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustmentInputs, setAdjustmentInputs] = useState({
    check_in_time: '',
    check_out_time: '',
    status: '',
    notes: '',
  });
  const canMarkAttendance = hasPermission('view_attendance_own') || hasPermission('manage_attendance_records');
  const canAdjustAttendance = hasPermission('manage_attendance_records');

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchTodayAttendance();
      fetchRecentRecords();
      fetchAttendanceSummary();
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
          setAdjustmentInputs({
            check_in_time: toInputLocal(data.items[0].check_in_time),
            check_out_time: toInputLocal(data.items[0].check_out_time),
            status: data.items[0].status ?? 'present',
            notes: data.items[0].notes ?? '',
          });
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

  async function fetchAttendanceSummary() {
    if (!auth.token || !auth.user) return;

    setSummaryLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      const empId = employeeId;
      const response = await fetch(
        `${API_BASE_URL}/attendance/summary/${empId}?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as AttendanceSummary;
        setAttendanceSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance summary:', err);
    } finally {
      setSummaryLoading(false);
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
        setAdjustmentInputs({
          check_in_time: toInputLocal(data.check_in_time),
          check_out_time: toInputLocal(data.check_out_time),
          status: data.status,
          notes: data.notes ?? '',
        });
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
        setAdjustmentInputs({
          check_in_time: toInputLocal(data.check_in_time),
          check_out_time: toInputLocal(data.check_out_time),
          status: data.status,
          notes: data.notes ?? '',
        });
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

  const toInputLocal = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const deriveAttendanceStatus = (record: AttendanceRecord) => {
    const status = record.status?.toLowerCase();
    if (status && status !== 'present') return status;
    if (record.is_half_day) return 'half-day';
    if (record.is_work_from_home) return 'work-from-home';
    if (record.is_late) return 'late';
    if (status) return status;
    if (record.check_in_time || record.check_out_time) return 'present';
    return 'absent';
  };

  const formatAttendanceStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'half-day':
        return 'Half Day';
      case 'work-from-home':
        return 'Work From Home';
      case 'holiday':
        return 'Holiday';
      case 'absent':
        return 'Absent';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatAttendanceRemark = (record: AttendanceRecord) => {
    const parts: string[] = [];
    const status = record.status?.toLowerCase();

    if (status === 'holiday') {
      parts.push('Holiday');
    }
    if (status === 'absent') {
      parts.push('Absent');
    }
    if (record.is_half_day) {
      parts.push('Half Day');
    }
    if (record.is_work_from_home) {
      parts.push('Work From Home');
    }
    if (record.is_late) {
      parts.push(`Late joined${record.late_minutes ? ` by ${record.late_minutes} min` : ''}`);
    }
    if (record.notes) {
      parts.push(`Note: ${record.notes}`);
    }

    if (parts.length === 0) {
      return formatAttendanceStatusLabel(record.status ? record.status : deriveAttendanceStatus(record));
    }

    return parts.join(' • ');
  };

  const calculateDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return null;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const statusSummary = {
    present: attendanceSummary?.present_days ?? 0,
    absent: attendanceSummary?.absent_days ?? 0,
    halfDay: attendanceSummary?.half_days ?? 0,
    workFromHome: attendanceSummary?.work_from_home_days ?? 0,
    late: attendanceSummary?.late_days ?? 0,
    holiday: (attendanceSummary?.records ?? []).filter((r) => r.status.toLowerCase() === 'holiday').length,
  };

  async function handleUpdateAttendance() {
    if (!auth.token || !auth.user || !todayAttendance) return;

    setAdjusting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: { check_in_time?: string; check_out_time?: string; status?: string; notes?: string } = {};
      if (adjustmentInputs.check_in_time) {
        payload.check_in_time = new Date(adjustmentInputs.check_in_time).toISOString();
      }
      if (adjustmentInputs.check_out_time) {
        payload.check_out_time = new Date(adjustmentInputs.check_out_time).toISOString();
      }
      if (adjustmentInputs.status) {
        payload.status = adjustmentInputs.status;
      }
      if (adjustmentInputs.notes) {
        payload.notes = adjustmentInputs.notes;
      }

      const response = await fetch(`${API_BASE_URL}/attendance/${todayAttendance.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update attendance');
      }

      const data = await response.json();
      setTodayAttendance(data);
      setAdjustmentInputs({
        check_in_time: toInputLocal(data.check_in_time),
        check_out_time: toInputLocal(data.check_out_time),
        status: data.status,
        notes: data.notes ?? '',
      });
      setSuccess('Attendance updated successfully');
      await fetchAttendanceSummary();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setAdjusting(false);
    }
  }

  const getStatusColor = (status?: string) => {
    const normalized = status?.toLowerCase() || 'absent';
    switch (normalized) {
      case 'present':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'late':
        return { bg: 'rgba(251, 191, 36, 0.12)', text: '#ca8a04' };
      case 'absent':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'half-day':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'work-from-home':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      case 'holiday':
        return { bg: 'rgba(14, 165, 233, 0.1)', text: '#0369a1' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
    }
  };

  const attendanceStats = [
    { label: 'Today status', value: formatAttendanceStatusLabel(todayAttendance?.status ?? 'pending'), accent: '#6366f1' },
    { label: 'Check-in', value: todayAttendance ? formatTime(todayAttendance.check_in_time) : '—', accent: '#10b981' },
    { label: 'Check-out', value: todayAttendance ? formatTime(todayAttendance.check_out_time) : '—', accent: '#f59e0b' },
    { label: 'Worked hours', value: todayAttendance ? formatAttendanceStatusLabel(calculateDuration(todayAttendance.check_in_time, todayAttendance.check_out_time) ?? 'Pending') : '—', accent: '#3B82F6' },
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

        <Grid container spacing={3} sx={{ mb: 0 }}>
          {[
            { label: 'Present', value: statusSummary.present, color: '#10b981' },
            { label: 'Half Day', value: statusSummary.halfDay, color: '#f59e0b' },
            { label: 'Late', value: statusSummary.late, color: '#ef4444' },
            { label: 'Absent', value: statusSummary.absent, color: '#64748b' },
            { label: 'WFH', value: statusSummary.workFromHome, color: '#3b82f6' },
            { label: 'Holiday', value: statusSummary.holiday, color: '#0f766e' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={4} key={stat.label}>
              <Card sx={{ ...commonCardStyles, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: stat.color }}>{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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

        {canAdjustAttendance && todayAttendance && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={commonCardStyles}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>Adjust Attendance Time</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Check-in time"
                        type="datetime-local"
                        value={adjustmentInputs.check_in_time}
                        onChange={(e) => setAdjustmentInputs((prev) => ({ ...prev, check_in_time: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Check-out time"
                        type="datetime-local"
                        value={adjustmentInputs.check_out_time}
                        onChange={(e) => setAdjustmentInputs((prev) => ({ ...prev, check_out_time: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Status"
                        select
                        fullWidth
                        value={adjustmentInputs.status}
                        onChange={(e) => setAdjustmentInputs((prev) => ({ ...prev, status: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      >
                        {['present', 'half-day', 'work-from-home', 'holiday', 'absent'].map((status) => (
                          <MenuItem key={status} value={status}>
                            {formatAttendanceStatusLabel(status)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="Notes"
                        value={adjustmentInputs.notes}
                        onChange={(e) => setAdjustmentInputs((prev) => ({ ...prev, notes: e.target.value }))}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateAttendance}
                        disabled={adjusting || !todayAttendance}
                        sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                      >
                        {adjusting ? 'Saving changes...' : 'Update attendance record'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Recent Attendance Table */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4, pb: '32px !important' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
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
                          <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Remark</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', align: 'right' }}>Late</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentRecords.map((record) => {
                          const recordStatus = deriveAttendanceStatus(record);
                          const colors = getStatusColor(recordStatus);
                          return (
                            <TableRow key={record.id} sx={{ '& td': { borderBottom: '1px solid #f8fafc', py: 2.5 } }}>
                              <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{formatDate(record.attendance_date)}</TableCell>
                              <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{formatTime(record.check_in_time)}</TableCell>
                              <TableCell sx={{ color: '#475569', fontWeight: 500 }}>{formatTime(record.check_out_time)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={formatAttendanceStatusLabel(record.status ? record.status : deriveAttendanceStatus(record))}
                                  size="small"
                                  sx={{
                                    bgcolor: colors.bg,
                                    color: colors.text,
                                    fontWeight: 700,
                                    px: 1
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: '#475569', fontWeight: 500, maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {formatAttendanceRemark(record)}
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
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
