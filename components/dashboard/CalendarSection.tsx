'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Grid, Alert, Skeleton, Chip } from '@mui/material';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '@/components/auth/AuthContext';
import { useDashboard } from './DashboardContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  is_all_day: boolean;
  color: string;
}

const resolveApiBaseUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (process.env.NODE_ENV === 'development') return raw || 'http://localhost:8000';
  if (!raw || raw.includes('your-backend-production-url.com')) return 'https://avicorex-hrms-server.onrender.com';
  return raw.replace(/\/$/, '');
};

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export function CalendarSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { refreshKey } = useDashboard();
  const API_BASE = resolveApiBaseUrl();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#60A5FA', 0.2) : '#e2e8f0';

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];

        const res = await fetch(
          `${API_BASE}/dashboard/calendar/events?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error('Failed to fetch calendar events');

        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch calendar:', err);
          setError(err.message || 'Failed to load calendar');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    return () => controller.abort();
  }, [token, currentMonth, API_BASE, refreshKey]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return events.filter((e) => e.start_time.split('T')[0] === date);
  };

  const eventCounts = events.reduce(
    (acc, event) => {
      acc.total += 1;
      if (event.event_type === 'holiday') acc.holiday += 1;
      if (event.event_type === 'leave') acc.leave += 1;
      return acc;
    },
    { total: 0, holiday: 0, leave: 0 } as Record<string, number>
  );

  if (loading && events.length === 0) {
    return <Skeleton variant="rounded" height={500} />;
  }

  return (
    <Stack spacing={2.5} sx={{ animation: `${floatIn} 280ms ease-out` }}>
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
                Calendar & Events
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 900, mt: 0.5 }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: 760 }}>
                Holidays, leave windows, and time-bound events are rendered for the selected month with live backend data.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`${eventCounts.total} events`} sx={{ bgcolor: alpha('#3B82F6', 0.15), color: '#93C5FD', fontWeight: 700 }} />
              <Chip label={`${eventCounts.holiday} holidays`} sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#fde68a', fontWeight: 700 }} />
              <Chip label={`${eventCounts.leave} leaves`} sx={{ bgcolor: alpha('#06b6d4', 0.15), color: '#a5f3fc', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <EventAvailableIcon sx={{ color: '#10b981' }} />
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>Events</Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 900 }}>{eventCounts.total}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CelebrationIcon sx={{ color: '#f59e0b' }} />
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>Holidays</Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 900 }}>{eventCounts.holiday}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <EventBusyIcon sx={{ color: '#06b6d4' }} />
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>Leaves</Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 900 }}>{eventCounts.leave}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ChevronRightIcon sx={{ color: '#3B82F6' }} />
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>Month</Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 900 }}>{currentMonth.getMonth() + 1}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 800 }}>Monthly Event Mix</Typography>
                <Stack direction="row" spacing={1}>
                  <Box
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    sx={{ cursor: 'pointer', p: 0.75, borderRadius: 1, '&:hover': { bgcolor: alpha('#3B82F6', 0.1) } }}
                  >
                    <ChevronLeftIcon />
                  </Box>
                  <Box
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    sx={{ cursor: 'pointer', p: 0.75, borderRadius: 1, '&:hover': { bgcolor: alpha('#3B82F6', 0.1) } }}
                  >
                    <ChevronRightIcon />
                  </Box>
                </Stack>
              </Stack>
              <Box sx={{ height: 260 }}>
                <BarChart
                  series={[{ data: [eventCounts.holiday, eventCounts.leave, Math.max(eventCounts.total - eventCounts.holiday - eventCounts.leave, 0)], label: 'Events', color: '#3B82F6' }]}
                  xAxis={[{ scaleType: 'band', data: ['Holiday', 'Leave', 'Other'] }]}
                  margin={{ left: 30, right: 20, top: 20, bottom: 30 }}
                  borderRadius={8}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card
            sx={{
              bgcolor: panelBg,
              border: `1px solid ${panelBorder}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Month View</Typography>
                <Stack direction="row" spacing={1}>
                  <Box
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    sx={{ cursor: 'pointer', p: 0.75, borderRadius: 1, '&:hover': { bgcolor: alpha('#3B82F6', 0.1) } }}
                  >
                    <ChevronLeftIcon />
                  </Box>
                  <Box
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    sx={{ cursor: 'pointer', p: 0.75, borderRadius: 1, '&:hover': { bgcolor: alpha('#3B82F6', 0.1) } }}
                  >
                    <ChevronRightIcon />
                  </Box>
                </Stack>
              </Stack>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Grid container spacing={0.5} sx={{ mb: 1.5 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Grid item xs={12 / 7} key={day}>
                    <Typography sx={{ textAlign: 'center', fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={0.5}>
                {days.map((day, idx) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();

                  return (
                    <Grid item xs={12 / 7} key={idx}>
                      <Box
                        sx={{
                          minHeight: 92,
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: isToday ? alpha('#3B82F6', 0.08) : alpha(isDark ? '#ffffff' : '#000000', 0.02),
                          border: isToday ? `1px solid #3B82F6` : `1px solid ${panelBorder}`,
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: `0 10px 24px ${alpha('#3B82F6', 0.08)}`,
                          },
                        }}
                      >
                        {day && (
                          <>
                            <Typography sx={{ fontWeight: isToday ? 800 : 600, fontSize: 14, mb: 0.5 }}>
                              {day}
                            </Typography>
                            <Stack spacing={0.5} sx={{ flex: 1, overflow: 'hidden' }}>
                              {dayEvents.slice(0, 2).map((evt) => (
                                <Chip
                                  key={evt.id}
                                  size="small"
                                  label={evt.title}
                                  sx={{
                                    bgcolor: alpha(evt.color, 0.18),
                                    color: evt.color,
                                    height: 18,
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                              {dayEvents.length > 2 && (
                                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                                  +{dayEvents.length - 2} more
                                </Typography>
                              )}
                            </Stack>
                          </>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {events.length > 0 && (
                <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${panelBorder}` }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Upcoming Events</Typography>
                  <Stack spacing={1}>
                    {events.slice(0, 5).map((event) => (
                      <Box key={event.id} sx={{ p: 1.25, borderRadius: 1.25, bgcolor: alpha(event.color, 0.08) }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{event.title}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {new Date(event.start_time).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
