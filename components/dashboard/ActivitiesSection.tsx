'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Chip, Alert, Skeleton, Button, Grid } from '@mui/material';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '@/components/auth/AuthContext';
import { useDashboard } from './DashboardContext';

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  actor_name: string;
  timestamp: string;
  icon: string;
  color: string;
  action_url?: string;
  priority: string;
}

const resolveApiBaseUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (process.env.NODE_ENV === 'development') return raw || 'http://localhost:8000';
  if (!raw || raw.includes('your-backend-production-url.com')) return 'https://avicorex-hrms-server.onrender.com';
  return raw.replace(/\/$/, '');
};

const getColorForPriority = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    default:
      return '#10b981';
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'leave_status':
      return '#7C3AED';
    case 'attendance':
      return '#06b6d4';
    case 'approval':
      return '#f59e0b';
    case 'announcement':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export function ActivitiesSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { refreshKey } = useDashboard();
  const API_BASE = resolveApiBaseUrl();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a855f7', 0.2) : '#e2e8f0';

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchActivities() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/dashboard/activity-feed?page=${page}&page_size=20`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch activity feed');

        const data = await res.json();
        setActivities(data.items || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch activities:', err);
          setError(err.message || 'Failed to load activities');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
    return () => controller.abort();
  }, [token, page, API_BASE, refreshKey]);

  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const activityCounts = activities.reduce(
    (acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      acc.total += 1;
      if (activity.priority === 'high') acc.high += 1;
      if (activity.priority === 'medium') acc.medium += 1;
      return acc;
    },
    { total: 0, high: 0, medium: 0, leave_status: 0, attendance: 0, approval: 0, announcement: 0 } as Record<string, number>
  );

  const chartLabels = ['Leave', 'Attend', 'Approvals', 'Msgs'];
  const chartValues = [
    activityCounts.leave_status || 0,
    activityCounts.attendance || 0,
    activityCounts.approval || 0,
    activityCounts.announcement || 0,
  ];

  if (activities.length === 0) {
    return (
      <Alert severity="info">
        No recent activities. Everything is up to date! ✨
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ animation: `${fadeUp} 280ms ease-out` }}>
      <Card
        sx={{
          bgcolor: panelBg,
          border: `1px solid ${panelBorder}`,
          backgroundImage: isDark
            ? 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(17,24,39,0.92))'
            : 'linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,1))',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: 'text.secondary' }}>
                Live Activity Feed
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 900, mt: 0.5 }}>
                What is happening right now
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 760 }}>
                Recent leaves, attendance, approvals, and announcements are pulled directly from the backend and shown in priority order.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`${activityCounts.total} events`} sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#c4b5fd', fontWeight: 700 }} />
              <Chip label={`${activityCounts.high} high priority`} sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#fecaca', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2.5}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {[
            { label: 'Events', value: activityCounts.total, color: '#8b5cf6' },
            { label: 'High Priority', value: activityCounts.high, color: '#ef4444' },
            { label: 'Medium Priority', value: activityCounts.medium, color: '#f59e0b' },
            { label: 'Attendance', value: activityCounts.attendance || 0, color: '#06b6d4' },
          ].map((item) => (
            <Card key={item.label} sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 900, color: item.color, lineHeight: 1.1, mt: 0.75 }}>{item.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>Activity Mix</Typography>
                </Stack>
                <Box sx={{ height: 260 }}>
                  <BarChart
                    series={[{ data: chartValues, label: 'Events', color: '#8b5cf6' }]}
                    xAxis={[{ scaleType: 'band', data: chartLabels }]}
                    margin={{ left: 30, right: 20, top: 20, bottom: 30 }}
                    borderRadius={8}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={2.25}>
              {activities.slice(0, 8).map((activity, index) => (
                <Card
                  key={activity.id}
                  sx={{
                    bgcolor: panelBg,
                    border: `1px solid ${panelBorder}`,
                    animation: `${fadeUp} ${220 + index * 60}ms ease-out`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 10px 30px ${alpha('#8b5cf6', 0.12)}`,
                      borderColor: alpha('#8b5cf6', 0.4),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.25 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: alpha(getColorForType(activity.type), 0.15),
                          display: 'grid',
                          placeItems: 'center',
                          color: getColorForType(activity.type),
                          flexShrink: 0,
                        }}
                      >
                        {activity.icon === 'check_circle' && '✓'}
                        {activity.icon === 'schedule' && '📅'}
                        {activity.icon === 'cancel' && '✕'}
                        {activity.icon === 'info' && 'ℹ'}
                        {activity.icon === '📋' && '📋'}
                        {!['check_circle', 'schedule', 'cancel', 'info', '📋'].includes(activity.icon) && activity.icon}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800 }}>{activity.title}</Typography>
                          <Chip
                            size="small"
                            label={activity.priority.toUpperCase()}
                            sx={{
                              bgcolor: alpha(getColorForPriority(activity.priority), 0.14),
                              color: getColorForPriority(activity.priority),
                              height: 22,
                              fontWeight: 700,
                            }}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={activity.type.replace('_', ' ').toUpperCase()}
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>

                        {activity.description && (
                          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
                            {activity.description}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ color: 'text.secondary', fontSize: 12 }}>
                          <Typography component="span">By: {activity.actor_name}</Typography>
                          <Typography component="span">{new Date(activity.timestamp).toLocaleString()}</Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}

              {activities.length > 8 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setPage((prev) => prev + 1)}
                    sx={{ borderRadius: 999, textTransform: 'none', px: 3 }}
                  >
                    Load more
                  </Button>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
