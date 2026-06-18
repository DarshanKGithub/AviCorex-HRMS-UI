'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography, Alert, Skeleton, Chip } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '@/components/auth/AuthContext';
import { useDashboard } from './DashboardContext';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/lib/apiBase';

interface OverviewStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export function OverviewSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { currentSpace, refreshKey } = useDashboard();
  const API_BASE = getApiBaseUrl();

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a855f7', 0.2) : '#e2e8f0';

  const { data: mySpaceData, isLoading: mySpaceLoading, error: mySpaceError } = useQuery({
    queryKey: ['dashboard', 'my-space', refreshKey],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/my-space`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch My Space data');
      return res.json();
    },
    enabled: !!token && currentSpace === 'my-space',
  });

  const { data: orgData, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ['dashboard', 'organization', refreshKey],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/organization`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Organization data');
      return res.json();
    },
    enabled: !!token && currentSpace === 'organization',
  });

  const loading = currentSpace === 'my-space' ? mySpaceLoading : orgLoading;
  const queryError = currentSpace === 'my-space' ? mySpaceError : orgError;
  const error = queryError instanceof Error ? queryError.message : (queryError ? String(queryError) : null);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const myHoursSeries = (mySpaceData?.recent_time_logs || [])
    .slice(0, 7)
    .reverse()
    .map((item: any) => item.worked_hours || 0);

  const orgDepartmentLabels = (orgData?.departments || []).slice(0, 6).map((dept: any) => dept.department_name);
  const orgDepartmentTotals = (orgData?.departments || []).slice(0, 6).map((dept: any) => dept.total_employees || 0);
  const orgAttendanceTrend = (orgData?.team_members || [])
    .slice(0, 7)
    .map((member: any) => (member.status === 'present' ? 1 : 0));

  const stats: OverviewStats[] =
    currentSpace === 'my-space' && mySpaceData
      ? [
          {
            label: 'Full Name',
            value: mySpaceData.full_name,
            icon: <PersonIcon />,
            color: '#7C3AED',
            subtext: mySpaceData.role,
          },
          {
            label: 'Department',
            value: mySpaceData.department || 'Unassigned',
            icon: <BusinessIcon />,
            color: '#10b981',
          },
          {
            label: 'Today Hours',
            value: `${mySpaceData.today_hours}h`,
            icon: <AccessTimeIcon />,
            color: '#f59e0b',
            subtext: 'Worked today',
          },
          {
            label: 'Pending Leaves',
            value: mySpaceData.pending_leaves,
            icon: <EventNoteIcon />,
            color: '#ef4444',
            subtext: 'Awaiting approval',
          },
        ]
      : orgData
        ? [
            {
              label: 'Total Employees',
              value: orgData.total_employees,
              icon: <PersonIcon />,
              color: '#7C3AED',
            },
            {
              label: 'Active Today',
              value: orgData.active_today,
              icon: <BusinessIcon />,
              color: '#10b981',
              subtext: `${((orgData.active_today / orgData.total_employees) * 100).toFixed(1)}% attendance`,
            },
            {
              label: 'On Leave',
              value: orgData.on_leave,
              icon: <EventNoteIcon />,
              color: '#f59e0b',
            },
            {
              label: 'Pending Approvals',
              value: orgData.pending_approvals_count,
              icon: <AccessTimeIcon />,
              color: '#ef4444',
            },
          ]
        : [];

  return (
    <Stack spacing={2.5} sx={{ animation: `${floatIn} 320ms ease-out` }}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${panelBorder}`,
          bgcolor: panelBg,
          backgroundImage: isDark
            ? 'linear-gradient(135deg, rgba(76,29,149,0.25), rgba(15,23,42,0.92))'
            : 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,255,255,1))',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                {currentSpace === 'my-space' ? 'Personal workspace' : 'Organization workspace'}
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, mt: 0.5 }}>
                {currentSpace === 'my-space' ? 'Your live work summary' : 'Organization health and flow'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 760 }}>
                {currentSpace === 'my-space'
                  ? 'Track attendance, leave status, and your current working trend from a clean, focused dashboard.'
                  : 'See attendance, headcount, and department distribution in one compact operational view.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="Live API" sx={{ bgcolor: alpha('#10b981', 0.14), color: '#10b981', fontWeight: 700 }} />
              <Chip label="Animated" sx={{ bgcolor: alpha('#38bdf8', 0.14), color: '#38bdf8', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card
            sx={{
              bgcolor: panelBg,
              border: `1px solid ${panelBorder}`,
              height: '100%',
              transition: 'all 0.3s ease',
              animation: `${floatIn} ${220 + idx * 80}ms ease-out`,
              '&:hover': {
                border: `1px solid ${alpha('#8b5cf6', 0.5)}`,
                boxShadow: `0 0 20px ${alpha(stat.color, 0.2)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                  <Box sx={{ color: stat.color, fontSize: 24 }}>{stat.icon}</Box>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
                  {stat.value}
                </Typography>

                {stat.subtext && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {stat.subtext}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                <TrendingUpIcon sx={{ color: '#8b5cf6' }} />
                <Typography sx={{ fontWeight: 800 }}>Work Hours Trend</Typography>
              </Stack>
              <Box sx={{ height: 280 }}>
                {currentSpace === 'my-space' ? (
                  <LineChart
                    series={[{ data: myHoursSeries.length ? myHoursSeries : [6, 7, 8, 8.5, 7.5, 0, 0], label: 'Hours worked', area: true, color: '#8b5cf6' }]}
                    xAxis={[{ scaleType: 'point', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }]}
                    grid={{ horizontal: true, vertical: false }}
                    margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                  />
                ) : (
                  <LineChart
                    series={[{ data: orgAttendanceTrend.length ? orgAttendanceTrend : [1, 1, 1, 0, 1, 0, 1], label: 'Present', area: true, color: '#10b981' }]}
                    xAxis={[{ scaleType: 'point', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }]}
                    grid={{ horizontal: true, vertical: false }}
                    margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                <GroupsIcon sx={{ color: '#10b981' }} />
                <Typography sx={{ fontWeight: 800 }}>
                  {currentSpace === 'my-space' ? 'Recent Activity' : 'Department Mix'}
                </Typography>
              </Stack>
              <Box sx={{ height: 280 }}>
                {currentSpace === 'my-space' ? (
                  <BarChart
                    series={[{ data: (mySpaceData?.recent_time_logs || []).slice(0, 5).map((item: any) => item.worked_hours || 0), label: 'Worked hours', color: '#f59e0b' }]}
                    xAxis={[{ scaleType: 'band', data: (mySpaceData?.recent_time_logs || []).slice(0, 5).map((_: any, index: number) => `D${index + 1}`) }]}
                    margin={{ left: 30, right: 20, top: 20, bottom: 30 }}
                    borderRadius={8}
                  />
                ) : (
                  <BarChart
                    series={[{ data: orgDepartmentTotals.length ? orgDepartmentTotals : [12, 8, 5], label: 'Employees', color: '#7C3AED' }]}
                    xAxis={[{ scaleType: 'band', data: orgDepartmentLabels.length ? orgDepartmentLabels : ['Engineering', 'People Ops', 'Finance'] }]}
                    margin={{ left: 30, right: 20, top: 20, bottom: 60 }}
                    borderRadius={8}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
