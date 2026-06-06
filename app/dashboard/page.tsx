'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, Stack, Avatar, 
  Chip, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Button, Alert 
} from '@mui/material';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// MOCK DATA FOR FALLBACKS
const PAYROLL_DATA = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 }, { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 }, { name: 'Aug', value: 3000 }, { name: 'Sep', value: 2000 },
  { name: 'Oct', value: 2780 }, { name: 'Nov', value: 1890 }, { name: 'Dec', value: 3490 },
];
const DEPARTMENT_DATA = [
  { name: 'Sales', value: 12, color: '#3b82f6' },
  { name: 'Human resource', value: 9, color: '#a78bfa' },
  { name: 'Finance', value: 8, color: '#10b981' },
  { name: 'IT', value: 80, color: '#c4b5fd' },
];
const COLOR_PALETTE = ['#3b82f6', '#a78bfa', '#10b981', '#c4b5fd', '#f59e0b', '#ec4899'];

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


// Reusable Circular Progress for Task Overview
function CustomCircularProgress({ value, color }: { value: number, color: string }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle 
          cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="4" 
          strokeDasharray={`${value}, 100`} 
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>{value}%</Typography>
      </Box>
    </Box>
  );
}

// Attendance Widget
function AttendanceWidget() {
  const theme = useTheme();
  const { token, user, status } = useAuth();
  const employeeId = useEmployeeId();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance, isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['attendance', employeeId, today],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${employeeId}&start_date=${today}&end_date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Unable to load attendance status right now.');
      const data = await response.json();
      return data.items?.[0] ?? null;
    },
    enabled: status === 'ready' && !!token && !!user && !!employeeId,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employee_id: employeeId, attendance_date: today, check_in_time: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to check in');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Checked in successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => setError(err.message || 'Failed to check in')
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employee_id: employeeId, attendance_date: today, check_out_time: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to check out');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Checked out successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => setError(err.message || 'Failed to check out')
  });

  const checking = checkInMutation.isPending || checkOutMutation.isPending;
  const displayError = error || (fetchError instanceof Error ? fetchError.message : null);

  return (
    <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', bgcolor: '#ffffff', p: 3, textAlign: 'center' }}>
      <Box sx={{ fontSize: 32, mb: 1 }}>📍</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Attendance Check-in</Box>
      <Box sx={{ fontSize: 18, fontWeight: 900, mb: 2 }}>{loading ? <Skeleton width={100} sx={{ mx: 'auto' }} /> : 'Manual only'}</Box>
      
      {todayAttendance?.check_in_time && (
        <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
          Checked in at {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
        </Box>
      )}
      {todayAttendance?.check_out_time && (
        <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: alpha('#f97316', 0.1), color: '#f97316', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
          Checked out at {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
        </Box>
      )}
      
      {displayError && <Alert severity="error" sx={{ mb: 1.5, textAlign: 'left', py: 0 }}>{displayError}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1.5, textAlign: 'left', py: 0 }}>{success}</Alert>}
      
      <Button
        fullWidth variant="contained"
        onClick={() => checkInMutation.mutate()}
        disabled={loading || checking || !!todayAttendance?.check_in_time}
        sx={{ borderRadius: 999, py: 1.1, fontWeight: 800, textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
      >
        {checking ? 'Checking in...' : todayAttendance?.check_in_time ? 'Already checked in' : 'Click to Check In'}
      </Button>
      <Button
        fullWidth variant="outlined"
        onClick={() => checkOutMutation.mutate()}
        disabled={loading || checking || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
        sx={{ mt: 1, borderRadius: 999, py: 1.1, fontWeight: 800, textTransform: 'none', borderColor: alpha('#f97316', 0.35), color: '#f97316' }}
      >
        {checking ? 'Checking out...' : todayAttendance?.check_out_time ? 'Already checked out' : 'Click to Check Out'}
      </Button>
    </Card>
  );
}

// Dynamic Calendar Widget
function CalendarWidget() {
  const { token, status } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    // Align to Sunday
    const day = d.getDay();
    const diff = d.getDate() - day; 
    return new Date(d.setDate(diff));
  });

  const [activeTab, setActiveTab] = useState<'all' | 'meeting' | 'task'>('all');

  // Dates for API range
  const startOfMonthStr = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonthStr = new Date(weekStart.getFullYear(), weekStart.getMonth() + 2, 0).toISOString().split('T')[0];

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', startOfMonthStr, endOfMonthStr],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/calendar/events?start_date=${startOfMonthStr}&end_date=${endOfMonthStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch calendar');
      return res.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const today = new Date();
  today.setHours(0,0,0,0);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  
  const filteredEvents = (calendarData?.events || []).filter((e: any) => {
    const evDate = new Date(e.start_time).toISOString().split('T')[0];
    if (evDate !== selectedDateStr) return false;
    
    if (activeTab === 'meeting') {
      if (!['meeting', 'interview'].includes(e.event_type)) return false;
    } else if (activeTab === 'task') {
      if (e.event_type !== 'task') return false;
    }
    // 'all' tab shows everything
    
    return true;
  });

  return (
    <Card sx={{ ...commonCardStyles, p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Calendar</Typography>
        <IconButton size="small" sx={{ bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#4f46e5' } }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <IconButton size="small" onClick={prevWeek}><ChevronLeftIcon /></IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
          {weekStart.toLocaleString('default', { month: 'long' })}, {weekStart.getFullYear()}
        </Typography>
        <IconButton size="small" onClick={nextWeek}><ChevronRightIcon /></IconButton>
      </Stack>
      
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        {days.map((d, i) => {
          const isPast = d.getTime() < today.getTime();
          const isSelected = d.getTime() === selectedDate.getTime();
          const dayName = d.toLocaleString('default', { weekday: 'short' });
          const dayNum = d.getDate();
          
          return (
            <Box 
              key={i} 
              onClick={() => { if (!isPast) setSelectedDate(d); }}
              sx={{ 
                textAlign: 'center', 
                bgcolor: isSelected ? '#e0e7ff' : 'transparent', 
                color: isPast ? '#cbd5e1' : (isSelected ? '#6366f1' : 'inherit'), 
                borderRadius: 2, p: 1, minWidth: 40,
                cursor: isPast ? 'not-allowed' : 'pointer',
                opacity: isPast ? 0.5 : 1,
                '&:hover': { bgcolor: isPast ? 'transparent' : (isSelected ? '#e0e7ff' : '#f8fafc') }
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', color: isPast ? '#cbd5e1' : (isSelected ? '#6366f1' : '#94a3b8'), fontWeight: 600 }}>
                {dayName}
              </Typography>
              <Typography sx={{ fontWeight: 800, mt: 0.5 }}>{dayNum}</Typography>
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={3} sx={{ borderBottom: '1px solid #f1f5f9', mb: 2, pb: 1 }}>
        <Typography 
          onClick={() => setActiveTab('all')}
          sx={{ fontSize: '0.8rem', color: activeTab === 'all' ? '#3b82f6' : '#94a3b8', fontWeight: activeTab === 'all' ? 800 : 600, borderBottom: activeTab === 'all' ? '2px solid #3b82f6' : 'none', pb: 1, mb: -1, cursor: 'pointer' }}
        >
          All
        </Typography>
        <Typography 
          onClick={() => setActiveTab('meeting')}
          sx={{ fontSize: '0.8rem', color: activeTab === 'meeting' ? '#3b82f6' : '#94a3b8', fontWeight: activeTab === 'meeting' ? 800 : 600, borderBottom: activeTab === 'meeting' ? '2px solid #3b82f6' : 'none', pb: 1, mb: -1, cursor: 'pointer' }}
        >
          Meetings
        </Typography>
        <Typography 
          onClick={() => setActiveTab('task')}
          sx={{ fontSize: '0.8rem', color: activeTab === 'task' ? '#3b82f6' : '#94a3b8', fontWeight: activeTab === 'task' ? 800 : 600, borderBottom: activeTab === 'task' ? '2px solid #3b82f6' : 'none', pb: 1, mb: -1, cursor: 'pointer' }}
        >
          To-do
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ maxHeight: 250, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>Loading...</Typography></Box>
        ) : filteredEvents.length === 0 ? (
          <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', py: 2 }}>No events scheduled for this day.</Typography>
        ) : (
          filteredEvents.map((ev: any) => (
            <Box key={ev.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{ev.title}</Typography>
                <IconButton size="small" sx={{ p: 0 }}><MoreHorizIcon fontSize="small" sx={{ color: '#cbd5e1' }}/></IconButton>
              </Stack>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, mb: 1.5, mt: 0.5 }}>
                {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Stack direction="row" spacing={-1}>
                {ev.attendees && ev.attendees.map((att: any, i: number) => (
                  <Avatar key={i} sx={{ width: 24, height: 24, border: '2px solid #ffffff', fontSize: '0.65rem' }}>{att[0] || '?'}</Avatar>
                ))}
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Card>
  );
}

export default function DashboardPage() {
  const { token, user, status } = useAuth();
  


  // LIVE API QUERIES
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['dashboard', 'org'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/organization`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch org data');
      return res.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const { data: mySpaceData, isLoading: spaceLoading } = useQuery({
    queryKey: ['dashboard', 'myspace'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/my-space`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch myspace data');
      return res.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch summary data');
      return res.json();
    },
    enabled: status === 'ready' && !!token,
  });

  // Derived Values
  const isLoading = orgLoading || spaceLoading || summaryLoading;
  
  // KPI Mapping
  const totalEmployees = orgData?.total_employees ?? 0;
  const activeToday = orgData?.active_today ?? 0;
  const pendingTasks = mySpaceData?.pending_tasks ?? 0;
  const onLeave = orgData?.on_leave ?? 0;

  // Attendance Logic
  const attPresent = summaryData?.attendance_summary?.present || 0;
  const attAbsent = summaryData?.attendance_summary?.absent || 0;
  const attTotal = attPresent + attAbsent + onLeave || 1; // avoid /0

  // Department Mapping
  const deptData = orgData?.departments?.map((d: any, i: number) => ({
    name: d.department_name,
    value: d.total_employees,
    color: COLOR_PALETTE[i % COLOR_PALETTE.length]
  })) || DEPARTMENT_DATA;

  const teamMembers = orgData?.team_members?.slice(0, 5) || [];
  const leaveRequests = mySpaceData?.pending_leave_approvals?.slice(0, 4) || [];

  return (
    <Box sx={{ bgcolor: '#f4f6fc', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.03em' }}>
          Hello {user?.full_name?.split(' ')[0] },
        </Typography>
        <Typography sx={{ color: '#64748b', mt: 0.5 }}>
          Lets get you get going.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ pt: 10, textAlign: 'center' }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} /></Box>
      ) : (
      <Grid container spacing={3}>
        
        {/* KPI ROW */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { title: 'Total employee', value: totalEmployees, icon: <PersonOutlineIcon />, color: '#6366f1', pill: '+ 2%', pillBg: '#dcfce7', pillColor: '#10b981' },
              { title: 'Active today', value: activeToday, icon: <PersonAddOutlinedIcon />, color: '#6366f1', pill: '+ 1%', pillBg: '#dcfce7', pillColor: '#10b981' },
              { title: 'Pending tasks', value: pendingTasks, icon: <AssignmentOutlinedIcon />, color: '#6366f1', pill: '- 5%', pillBg: '#fee2e2', pillColor: '#ef4444' },
              { title: 'Employee on leave', value: onLeave, icon: <DirectionsWalkOutlinedIcon />, color: '#6366f1', pill: '0%', pillBg: '#f1f5f9', pillColor: '#64748b' },
            ].map((kpi, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ ...commonCardStyles, p: 2.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, mb: 2 }}>
                    {kpi.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, letterSpacing: '-0.02em' }}>
                    {kpi.value}
                  </Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                      {kpi.title}
                    </Typography>
                    <Box sx={{ bgcolor: kpi.pillBg, color: kpi.pillColor, px: 1, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700 }}>
                      {kpi.pill}
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* MIDDLE ROW */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* PAYROLL CHART (MOCKED) */}
            <Grid item xs={12} md={4}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>Payroll</Typography>
                <Box sx={{ height: 220, width: '100%', ml: -2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PAYROLL_DATA}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                      <RechartsTooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* TASK OVERVIEW (MOCKED WITH SOME LIVE DATA) */}
            <Grid item xs={12} md={3}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>Task overview</Typography>
                <Stack spacing={3}>
                  {[
                    { title: 'Pending projects', sub: `${pendingTasks} projects`, val: Math.min(pendingTasks * 10, 100), color: '#10b981' },
                    { title: 'New Inflow', sub: '09 projects', val: 7, color: '#3b82f6' },
                    { title: 'PM review', sub: '04 projects', val: 87, color: '#10b981' },
                    { title: 'Client review', sub: '15 projects', val: 46, color: '#10b981' },
                  ].map((task, i) => (
                    <Stack direction="row" alignItems="center" justifyContent="space-between" key={i}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>{task.title}</Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{task.sub}</Typography>
                      </Box>
                      <CustomCircularProgress value={task.val} color={task.color} />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* ATTENDANCE & DEPARTMENT (LIVE) */}
            <Grid item xs={12} md={2}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Card sx={{ ...commonCardStyles, p: 3, flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>Attendance</Typography>
                  <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2 }}>
                    <Box sx={{ width: `${(attAbsent / attTotal) * 100}%`, bgcolor: '#c4b5fd' }} />
                    <Box sx={{ width: `${(attPresent / attTotal) * 100}%`, bgcolor: '#3b82f6' }} />
                    <Box sx={{ width: `${(onLeave / attTotal) * 100}%`, bgcolor: '#94a3b8' }} />
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}><Typography sx={{ fontSize: 10, color: '#64748b' }}>Absence</Typography><Typography sx={{ fontWeight: 800 }}>{attAbsent}</Typography></Grid>
                    <Grid item xs={4}><Typography sx={{ fontSize: 10, color: '#64748b' }}>Present</Typography><Typography sx={{ fontWeight: 800 }}>{attPresent}</Typography></Grid>
                    <Grid item xs={4}><Typography sx={{ fontSize: 10, color: '#64748b' }}>On leave</Typography><Typography sx={{ fontWeight: 800 }}>{onLeave}</Typography></Grid>
                  </Grid>
                </Card>
                
                <Card sx={{ ...commonCardStyles, p: 3, flex: 1.5, position: 'relative' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Department</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 100, height: 100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={deptData} innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                            {deptData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ ml: 1 }}>
                      {deptData.map((dept: any, i: number) => (
                        <Stack direction="row" alignItems="center" spacing={1} key={i} sx={{ mb: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dept.color }} />
                          <Typography sx={{ fontSize: '0.65rem', color: '#64748b', width: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.name}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>{dept.value}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                </Card>
              </Stack>
            </Grid>

            {/* CALENDAR */}
            <Grid item xs={12} md={3}>
              <CalendarWidget />
            </Grid>
          </Grid>
        </Grid>

        {/* BOTTOM ROW */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* RECENT */}
            <Grid item xs={12} md={6}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Recent</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: 2, px: 2, py: 0.5 }}>
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
                      <InputBase placeholder="Search for employee" sx={{ fontSize: '0.85rem' }} />
                    </Box>
                    <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ borderRadius: 2, textTransform: 'none', color: '#6366f1', borderColor: '#e0e7ff', fontWeight: 700 }}>Filter</Button>
                  </Stack>
                </Stack>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ color: '#64748b', borderBottom: 'none', fontWeight: 600, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>Date</TableCell>
                        <TableCell sx={{ color: '#64748b', borderBottom: 'none', fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ color: '#64748b', borderBottom: 'none', fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ color: '#64748b', borderBottom: 'none', fontWeight: 600, borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamMembers.length === 0 ? (
                        <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>No recent activity</TableCell></TableRow>
                      ) : teamMembers.map((emp: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar src={emp.avatar_url || ''} sx={{ width: 28, height: 28 }} />
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>{emp.full_name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>{emp.role}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Chip label={emp.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 700, borderRadius: 1.5, fontSize: '0.7rem' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            </Grid>

            {/* SATISFACTION */}
            <Grid item xs={12} md={3}>
              <Card sx={{ ...commonCardStyles, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>Satisfaction</Typography>
                <Box sx={{ position: 'relative', height: 160, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={[{ value: 67 }, { value: 33 }]}
                        cx="50%" cy="92%"
                        startAngle={180} endAngle={0}
                        innerRadius={60} outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={40}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#3b82f6' }}>67.09%</Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', mt: 2, px: 2 }}>
                  Out of all employees, <strong style={{color:'#6366f1'}}>{Math.round(totalEmployees * 0.67)}</strong> are satisfied and have increased 12% from last month
                </Typography>
              </Card>
            </Grid>

            {/* LEAVE REQUESTS (LIVE) */}
            <Grid item xs={12} md={3}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Leave requests</Typography>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', color: '#6366f1', borderColor: '#e0e7ff', fontWeight: 700, py: 0 }}>View all</Button>
                </Stack>
                <Stack spacing={2.5}>
                  {leaveRequests.length === 0 ? (
                    <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>No pending requests</Typography>
                  ) : leaveRequests.map((req: any) => (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" key={req.id}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36 }}>{req.employee_name[0]}</Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{req.employee_name}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{req.start_date}</Typography>
                        </Box>
                      </Stack>
                      <IconButton size="small" sx={{ border: '1px solid #f1f5f9' }}><ChevronRightIcon fontSize="small" sx={{ color: '#94a3b8' }}/></IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      )}
    </Box>
  );
}
