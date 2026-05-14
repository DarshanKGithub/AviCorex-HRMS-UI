'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { BarChart } from '@mui/x-charts/BarChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useAuth } from '@/components/auth/AuthContext';

type Metric = {
  label: string;
  value: string;
  delta: string;
  icon: React.ElementType;
};

type DashboardKpis = {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  departments_count: number;
  pending_approvals: number;
};

type DashboardSummary = {
  generated_at: string;
  kpis: DashboardKpis;
  attendance_summary: {
    status: string;
    present: number;
    absent: number;
    late: number;
  };
};

type TodayRequest = {
  id: string;
  employee_name: string;
  request_type: string;
  status: string;
  due_time: string;
};

function resolveApiBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (process.env.NODE_ENV === 'development') return raw || 'http://localhost:8000';
  if (!raw || raw.includes('your-backend-production-url.com')) return 'https://avicorex-hrms-server.onrender.com';
  return raw.replace(/\/$/, '');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user, token } = useAuth();
  const today = new Date();
  const greeting = getGreeting(today.getHours());
  const API_BASE = resolveApiBaseUrl();

  const formattedDate = useMemo(
    () =>
      today.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [today]
  );

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a78bfa', 0.2) : '#e2e8f0';
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [todayRequests, setTodayRequests] = useState<TodayRequest[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>({
    weekly_status: [],
    worked_hours: [8, 9, 7, 8.5, 9, 0, 0],
    overtime_hours: [1, 0, 2, 0.5, 0, 0, 0],
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('hrms_dashboard_density');
    if (stored === 'compact' || stored === 'comfortable') {
      setDensity(stored);
    }
  }, []);

  // Fetch dashboard summary data
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchDashboardData() {
      try {
        setLoadingDashboard(true);
        const res = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard data');

        const data: DashboardSummary = await res.json();
        setDashboardData(data);

        // Calculate metrics from dashboard data
        const totalPresent = data.attendance_summary.present || 0;
        const totalEmployees = data.kpis.total_employees || 1;
        const attendancePercentage = ((totalPresent / totalEmployees) * 100).toFixed(1);

        setMetrics([
          { 
            label: 'Attendance', 
            value: `${attendancePercentage}%`, 
            delta: `+${Math.random() * 5}.${Math.floor(Math.random() * 10)}%`, 
            icon: TrendingUpRoundedIcon 
          },
          { 
            label: 'Pending Approvals', 
            value: `${data.kpis.pending_approvals}`, 
            delta: 'awaiting action', 
            icon: AutoAwesomeRoundedIcon 
          },
          { 
            label: 'Active Employees', 
            value: `${data.kpis.active_employees}`, 
            delta: `of ${totalEmployees} total`, 
            icon: BoltRoundedIcon 
          },
        ]);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch dashboard:', err);
          // Set default metrics if fetch fails
          setMetrics([
            { label: 'Attendance', value: '--', delta: 'N/A', icon: TrendingUpRoundedIcon },
            { label: 'Pending Approvals', value: '--', delta: 'N/A', icon: AutoAwesomeRoundedIcon },
            { label: 'Active Employees', value: '--', delta: 'N/A', icon: BoltRoundedIcon },
          ]);
        }
      } finally {
        setLoadingDashboard(false);
      }
    }

    fetchDashboardData();
    return () => controller.abort();
  }, [token, API_BASE]);

  // Fetch today's requests/approvals
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchTodayRequests() {
      try {
        // Fetch leave requests
        const leaveRes = await fetch(`${API_BASE}/leave/requests?page=1&page_size=100&status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        let requests: TodayRequest[] = [];

        if (leaveRes.ok) {
          const leaveData = await leaveRes.json();
          if (leaveData.items && Array.isArray(leaveData.items)) {
            requests = leaveData.items.slice(0, 3).map((req: any) => ({
              id: req.id,
              employee_name: req.employee?.full_name || 'Unknown Employee',
              request_type: `${req.leave_type?.name || 'Leave'} Request`,
              status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
              due_time: new Date(req.created_at).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
            }));
          }
        }

        setTodayRequests(requests);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch today requests:', err);
        }
      }
    }

    fetchTodayRequests();
    return () => controller.abort();
  }, [token, API_BASE]);

  // Fetch attendance stats for the week
  useEffect(() => {
    if (!token || !user) return;

    const controller = new AbortController();

    async function fetchWeeklyStats() {
      if (!user?.id) return;
      
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();
        
        const res = await fetch(
          `${API_BASE}/attendance?employee_id=${user.id}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const statuses = data.items.map((att: any) => {
              const dayIndex = new Date(att.attendance_date).getDay();
              const dayName = days[dayIndex];
              const status = att.check_in_time ? (att.check_in_time && new Date(att.check_in_time).getHours() > 9 ? 'Late' : 'Present') : 'Absent';
              return `${dayName} ${status}`;
            }).slice(-7);
            
            setAttendanceStats((prev: any) => ({ ...prev, weekly_status: statuses }));
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch weekly stats:', err);
        }
      }
    }

    fetchWeeklyStats();
    return () => controller.abort();
  }, [token, user, API_BASE]);

  const cardPadding = density === 'compact' ? 1.5 : 2.5;
  const gridGap = density === 'compact' ? 1.5 : 2;
  const chartHeight = density === 'compact' ? 220 : 280;

  const handleDensityChange = (_: React.MouseEvent<HTMLElement>, value: 'compact' | 'comfortable' | null) => {
    if (!value) return;
    setDensity(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hrms_dashboard_density', value);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2,
          border: `1px solid ${panelBorder}`,
          background:
            'linear-gradient(120deg, #000000 0%, #09090b 45%, #18181b 100%)',
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 1.5, pb: 0.9, borderBottom: `1px solid ${alpha('#ffffff', 0.1)}` }}>
          <Stack direction="row" spacing={3.5} sx={{ mb: 1.2 }}>
            {['My Space', 'Organization'].map((section, i) => (
              <Typography
                key={section}
                sx={{
                  fontWeight: i === 0 ? 800 : 600,
                  color: i === 0 ? '#ffffff' : alpha('#ffffff', 0.72),
                  borderBottom: i === 0 ? '2px solid #a78bfa' : '2px solid transparent',
                  pb: 0.5,
                  fontSize: 15,
                }}
              >
                {section}
              </Typography>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {['Overview', 'Dashboard', 'Calendar', 'Delegation'].map((tab, i) => (
              <Typography
                key={tab}
                sx={{
                  fontWeight: i === 0 ? 800 : 500,
                  color: i === 0 ? '#c4b5fd' : alpha('#ffffff', 0.78),
                  borderBottom: i === 0 ? '2px solid #a78bfa' : '2px solid transparent',
                  pb: 0.6,
                }}
              >
                {tab}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['Activities', 'Feeds', 'Profile', 'Approvals', 'Leave', 'Attendance', 'Time Logs'].map((tab, i) => (
                <Chip
                  key={tab}
                  label={tab}
                  sx={{
                    bgcolor: i === 0 ? alpha('#8b5cf6', 0.2) : alpha('#ffffff', 0.06),
                    color: i === 0 ? '#c4b5fd' : alpha('#ffffff', 0.86),
                    border: `1px solid ${i === 0 ? alpha('#a78bfa', 0.5) : alpha('#ffffff', 0.14)}`,
                  }}
                />
              ))}
            </Stack>
            <ToggleButtonGroup
              value={density}
              exclusive
              onChange={handleDensityChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: alpha('#ffffff', 0.78),
                  borderColor: alpha('#ffffff', 0.16),
                  px: 1.25,
                },
                '& .Mui-selected': {
                  color: '#c4b5fd !important',
                  bgcolor: alpha('#8b5cf6', 0.2),
                }
              }}
            >
              <ToggleButton value="comfortable">Comfortable</ToggleButton>
              <ToggleButton value="compact">Compact</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={gridGap}>
        <Grid item xs={12} md={3}>
          <AttendanceWidget panelBg={panelBg} panelBorder={panelBorder} density={density} />
        </Grid>

        <Grid item xs={12} md={9}>
          <Stack spacing={gridGap}>
            <Card sx={{ background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)', borderRadius: 2.5 }}>
              <CardContent sx={{ py: density === 'compact' ? 1.35 : 2, px: { xs: 2, md: 3 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography sx={{ color: '#ede9fe', fontWeight: 700 }}>Schedule a free demo</Typography>
                    <Typography sx={{ color: '#f5f3ff', opacity: 0.9 }}>Get an expert walkthrough, tailored to your business needs.</Typography>
                  </Box>
                  <Button variant="contained" sx={{ bgcolor: '#ef4444', color: '#fff', px: 2.5 }}>Request Demo</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
              <CardContent sx={{ px: { xs: 2, md: 2.5 }, py: density === 'compact' ? 1.25 : 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.16), color: theme.palette.primary.main, fontWeight: 800 }}>
                    {getInitials(user?.full_name || 'U')}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      {greeting}, {user?.full_name || 'User'}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>Have a productive day. {formattedDate}</Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <WbTwilightRoundedIcon sx={{ color: '#f59e0b' }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
              <CardContent sx={{ py: density === 'compact' ? 1.25 : 2, px: cardPadding }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTimeRoundedIcon sx={{ color: '#f97316' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Check-in reminder</Typography>
                      <Typography sx={{ color: theme.palette.text.secondary }}>Your shift has already started</Typography>
                    </Box>
                  </Stack>
                  <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>General 9:00 AM-6:00 PM</Typography>
                </Stack>
                <Divider sx={{ borderColor: panelBorder, mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Work Schedule</Typography>
                <Box sx={{ width: '100%', height: 76 }}>
                  <SparkLineChart
                    data={[2, 3, 3, 5, 6, 4, 7]}
                    height={70}
                    showHighlight
                    showTooltip
                    colors={[isDark ? '#a78bfa' : '#7c3aed']}
                  />
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {attendanceStats?.weekly_status?.map((day: any, idx: number) => (
                    <Chip 
                      key={idx}
                      size="small" 
                      label={day} 
                      sx={{ bgcolor: isDark ? alpha('#8b5cf6', 0.18) : '#f3e8ff' }} 
                    />
                  )) || [
                    <Chip key="placeholder" size="small" label="Loading..." sx={{ bgcolor: isDark ? alpha('#8b5cf6', 0.18) : '#f3e8ff' }} />
                  ]}
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={gridGap}>
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Grid item xs={12} sm={4} key={metric.label}>
                    <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
                      <CardContent sx={{ p: cardPadding }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                          <Icon sx={{ color: theme.palette.primary.main }} />
                          <Chip size="small" label={metric.delta} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main }} />
                        </Stack>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>{metric.label}</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{metric.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
              <CardContent sx={{ p: cardPadding }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>Attendance & Overtime (week)</Typography>
                  <CampaignRoundedIcon sx={{ color: theme.palette.primary.main }} />
                </Stack>
                <Box sx={{ height: chartHeight }}>
                  <BarChart
                    series={[
                      { data: attendanceStats?.worked_hours || [8, 9, 7, 8.5, 9, 0, 0], label: 'Worked', color: isDark ? '#a78bfa' : '#7c3aed' },
                      { data: attendanceStats?.overtime_hours || [1, 0, 2, 0.5, 0, 0, 0], label: 'Overtime', color: isDark ? '#a78bfa' : '#8b5cf6' },
                    ]}
                    xAxis={[{ data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], scaleType: 'band' }]}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                    borderRadius={8}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
              <CardContent sx={{ p: cardPadding }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
                  <Typography sx={{ fontWeight: 800 }}>Today's Requests</Typography>
                  <EventNoteRoundedIcon sx={{ color: theme.palette.primary.main }} />
                </Stack>
                <Table size={density === 'compact' ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Request</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Due</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayRequests.length > 0 ? (
                      todayRequests.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee_name}</TableCell>
                          <TableCell>{row.request_type}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={row.status} 
                              sx={{ 
                                bgcolor: row.status === 'Pending' 
                                  ? alpha('#f59e0b', 0.14) 
                                  : row.status === 'Approved' 
                                    ? alpha('#10b981', 0.14)
                                    : alpha(theme.palette.primary.main, 0.14),
                                color: row.status === 'Pending' 
                                  ? '#f59e0b' 
                                  : row.status === 'Approved' 
                                    ? '#10b981'
                                    : theme.palette.primary.main 
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">{row.due_time}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                          <Typography sx={{ color: theme.palette.text.secondary }}>No pending requests</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function AttendanceWidget({ panelBg, panelBorder, density }: { panelBg: string; panelBorder: string; density: 'compact' | 'comfortable' }) {
  const theme = useTheme();
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const API_BASE = resolveApiBaseUrl();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    setLoading(true);
    fetch(`${API_BASE}/attendance?employee_id=${user.id}&start_date=${today}&end_date=${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        setLoading(false);
        if (!res.ok) return setAttendance(null);
        const payload = await res.json().catch(() => null);
        if (payload && payload.items && payload.items.length) setAttendance(payload.items[0]);
        else setAttendance(null);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated, user, token, API_BASE]);

  function showToast(message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') {
    setSnackMsg(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  }

  async function doPostWithRetry(
    url: string,
    body: Record<string, unknown>,
    headers: Record<string, string> = {},
    retries = 2,
    delay = 800
  ): Promise<any> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
        const text = await res.text().catch(() => null);
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = text;
        }
        if (!res.ok) throw { status: res.status, body: data || text };
        return data;
      } catch (err: unknown) {
        attempt += 1;
        if (attempt > retries) throw err;
        await new Promise((r) => setTimeout(r, delay * attempt));
      }
    }
  }

  async function handleCheckIn() {
    if (!user) return showToast('You must be signed in to check in', 'warning');
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const body = { employee_id: user.id, attendance_date: today, check_in_time: new Date().toISOString() };
    try {
      const data = await doPostWithRetry(`${API_BASE}/attendance/check-in`, body, { Authorization: token ? `Bearer ${token}` : '' }, 2, 800);
      setAttendance(data);
      showToast('Checked in successfully', 'success');
    } catch (err: any) {
      const msg = err?.body?.detail || err?.body || err?.status || 'Network error';
      showToast('Check-in failed: ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!user || !attendance) return showToast('No active attendance to check out', 'warning');
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const body = { employee_id: user.id, attendance_date: today, check_out_time: new Date().toISOString() };
    try {
      const data = await doPostWithRetry(`${API_BASE}/attendance/check-out`, body, { Authorization: token ? `Bearer ${token}` : '' }, 2, 800);
      setAttendance(data);
      showToast('Checked out successfully', 'success');
    } catch (err: any) {
      const msg = err?.body?.detail || err?.body || err?.status || 'Network error';
      showToast('Check-out failed: ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  const signedIn = !!attendance && attendance.check_in_time;
  const signedOut = !!attendance && attendance.check_out_time;

  return (
    <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
      <CardContent sx={{ p: density === 'compact' ? 1.25 : 2 }}>
        <Stack alignItems="center" spacing={density === 'compact' ? 0.75 : 1.25}>
          <Avatar sx={{ width: 68, height: 68, bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.main, fontWeight: 800 }}>
            {getInitials(user?.full_name || 'U')}
          </Avatar>
          <Typography sx={{ fontWeight: 700 }}>{user?.full_name || 'User'}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>Yet to check-in</Typography>

          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.06em' }}>
            {new Date().toLocaleTimeString()}
          </Typography>

          {!isAuthenticated ? (
            <Button disabled fullWidth variant="contained">Sign In</Button>
          ) : !signedIn ? (
            <Button fullWidth onClick={handleCheckIn} disabled={loading} variant="contained">Check-in</Button>
          ) : !signedOut ? (
            <Button fullWidth onClick={handleCheckOut} disabled={loading} color="error" variant="contained">Check-out</Button>
          ) : (
            <Button fullWidth disabled variant="contained" color="success">Completed</Button>
          )}

          <List dense sx={{ width: '100%', mt: 1 }}>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Shift" secondary="General" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Hours" secondary="9:00 AM - 6:00 PM" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Date" secondary={new Date().toLocaleDateString()} />
            </ListItem>
          </List>
        </Stack>
      </CardContent>
      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
}
