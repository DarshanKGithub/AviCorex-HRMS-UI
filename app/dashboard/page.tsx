'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack,
  Button, Avatar, Divider, Chip, List, ListItem,
  ListItemAvatar, ListItemText, IconButton, Snackbar, Alert
} from '@mui/material';
import {
  CheckCircle, InfoOutlined, Circle, TrendingUp, Bolt,
  MoreHoriz, CalendarMonth, LocalBar
} from '@mui/icons-material';
import { useAuth } from '@/components/auth/AuthContext';

// MUI X Charts Imports
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

const DESIGN = {
  glass: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 2,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    blue: '#3b82f6'
  }
};

export default function MuiXDashboard() {
  const { user } = useAuth();

  // Dynamic Date Formatting
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Dynamic Location with Fallback
  const userLocation = (user as any)?.location ;

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* 1. HEADER SECTION - Dynamic */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: DESIGN.text.primary, letterSpacing: '-0.04em' }}>
            Workforce Insights
          </Typography>
          <Typography sx={{ color: DESIGN.text.secondary, fontWeight: 500 }}>
            {formattedDate}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<CalendarMonth />} sx={{ textTransform: 'none', fontWeight: 600, color: DESIGN.text.primary }}>Schedule</Button>
          <IconButton sx={{ border: '1px solid #e2e8f0' }}><MoreHoriz /></IconButton>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>

            {/* HERO BANNER WITH INTEGRATED SPARKLINE */}
            <Card sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff', borderRadius: 8, overflow: 'hidden', position: 'relative'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Chip label="Live Metrics" size="small" sx={{ bgcolor: 'rgba(59, 132, 246, 0.3)', color: '#60a5fa', mb: 2, fontWeight: 700 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>92.4% Performance</Typography>
                    <Typography sx={{ opacity: 0.7, mb: 3 }}>Your team's productivity is up 12% from last month.</Typography>
                    <Button variant="contained" sx={{ bgcolor: '#3b82f6', borderRadius: 2, px: 4, py: 1.2, fontWeight: 700, textTransform: 'none' }}>
                      View Full Audit
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    {/* MUI X Sparkline Chart */}
                    <Box sx={{ height: 100 }}>
                      <Typography sx={{ fontSize: '0.7rem', opacity: 0.5, mb: 1, textAlign: 'right' }}>30-DAY TREND</Typography>
                      <SparkLineChart
                        data={[3, 5, 2, 8, 5, 9, 7, 4, 10, 8, 12, 10]}
                        height={80}
                        showTooltip
                        showHighlight
                        colors={['#3b82f6']}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* PRODUCTIVITY BAR CHART (MUI X) */}
            <Card sx={DESIGN.glass}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Attendance & Hours</Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <BarChart
                    series={[
                      { data: [8, 9, 7, 8.5, 9, 0, 0], label: 'Worked Hours', color: '#3b82f6' },
                      { data: [1, 0, 2, 0.5, 0, 0, 0], label: 'Overtime', color: '#94a3b8' },
                    ]}
                    xAxis={[{ data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], scaleType: 'band' }]}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                    borderRadius={8}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>

            {/* LEAVE DISTRIBUTION PIE CHART (MUI X) */}
            <Card sx={DESIGN.glass}>
              <CardContent>
                <Typography sx={{ fontWeight: 800, mb: 2 }}>Leave Distribution</Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[
                      {
                        data: [
                          { id: 0, value: 10, label: 'Annual', color: '#0f172a' },
                          { id: 1, value: 5, label: 'Sick', color: '#3b82f6' },
                          { id: 2, value: 2, label: 'Casual', color: '#cbd5e1' },
                        ],
                        innerRadius: 60,
                        paddingAngle: 5,
                        cornerRadius: 5,
                      },
                    ]}
                    slotProps={{ legend: { hidden: true } }}
                  />
                </Box>
                <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Circle sx={{ fontSize: 8, color: '#0f172a' }} /> Annual
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Circle sx={{ fontSize: 8, color: '#3b82f6' }} /> Sick
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* CLOCK IN CARD */}
            <AttendanceCard />

            {/* QUICK TEAM STATS */}
            <Card sx={DESIGN.glass}>
              <CardContent>
                <Typography sx={{ fontWeight: 800, mb: 2 }}>Team Presence</Typography>
                <List disablePadding>
                  {[
                    { name: 'Sarah Connor', status: 'In-Office', color: '#10b981' },
                    { name: 'Mike Ross', status: 'Remote', color: '#3b82f6' }
                  ].map((person, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}>{person.name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{person.name}</Typography>}
                        secondary={person.status}
                      />
                      <Circle sx={{ color: person.color, fontSize: 10 }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}


function resolveApiBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (process.env.NODE_ENV === 'development') return raw || 'http://localhost:8000';
  if (!raw || raw.includes('your-backend-production-url.com')) return 'https://avicorex-hrms-server.onrender.com';
  return raw.replace(/\/$/, '');
}

function AttendanceCard() {
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
    fetch(`${API_BASE}/attendance?employee_id=${user.id}&start_date=${today}&end_date=${today}` , {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (res) => {
      setLoading(false);
      if (!res.ok) return setAttendance(null);
      const payload = await res.json().catch(() => null);
      if (payload && payload.items && payload.items.length) setAttendance(payload.items[0]);
      else setAttendance(null);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, user, token]);

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
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
        const text = await res.text().catch(() => null);
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { data = text; }
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
      console.debug('Attempting check-in', { API_BASE, employee_id: user.id });
      const data = await doPostWithRetry(`${API_BASE}/attendance/check-in`, body, { Authorization: token ? `Bearer ${token}` : '' }, 2, 800);
      setAttendance(data);
      showToast('Checked in successfully', 'success');
    } catch (err: any) {
      console.error('Check-in error', err);
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
      console.debug('Attempting check-out', { API_BASE, employee_id: user.id });
      const data = await doPostWithRetry(`${API_BASE}/attendance/check-out`, body, { Authorization: token ? `Bearer ${token}` : '' }, 2, 800);
      setAttendance(data);
      showToast('Checked out successfully', 'success');
    } catch (err: any) {
      console.error('Check-out error', err);
      const msg = err?.body?.detail || err?.body || err?.status || 'Network error';
      showToast('Check-out failed: ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  const signedIn = !!attendance && attendance.check_in_time;
  const signedOut = !!attendance && attendance.check_out_time;

  return (
    <Card sx={{ borderRadius: 8, bgcolor: '#3b82f6', color: '#fff', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2)' }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.8, mb: 1 }}>SHIFT STATUS: ACTIVE</Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{new Date().toLocaleTimeString()}</Typography>
        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
        {!isAuthenticated ? (
          <Button disabled fullWidth variant="contained" sx={{ bgcolor: '#fff', color: '#3b82f6', fontWeight: 800, py: 1.5, borderRadius: 3 }}>Sign In Now</Button>
        ) : (
          <>
            {!signedIn ? (
              <Button fullWidth onClick={handleCheckIn} disabled={loading} variant="contained" sx={{ bgcolor: '#fff', color: '#3b82f6', fontWeight: 800, py: 1.5, borderRadius: 3 }}>Sign In Now</Button>
            ) : !signedOut ? (
              <Button fullWidth onClick={handleCheckOut} disabled={loading} variant="contained" sx={{ bgcolor: '#fff', color: '#3b82f6', fontWeight: 800, py: 1.5, borderRadius: 3 }}>Sign Out</Button>
            ) : (
              <Button fullWidth disabled variant="contained" sx={{ bgcolor: '#fff', color: '#3b82f6', fontWeight: 800, py: 1.5, borderRadius: 3 }}>Attendance Completed</Button>
            )}

            {attendance && (
              <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.9)' }}>
                {attendance.check_in_time ? `Checked in: ${new Date(attendance.check_in_time).toLocaleTimeString()}` : ''}
                {attendance.check_out_time ? ` • Checked out: ${new Date(attendance.check_out_time).toLocaleTimeString()}` : ''}
              </Typography>
            )}
          </>
        )}
      </CardContent>
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
}