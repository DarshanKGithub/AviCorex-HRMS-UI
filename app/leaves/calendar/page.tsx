'use client';

import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Grid, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LeaveCalendarPage() {
  const { token, status } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });

  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendarEvents', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/calendar/events?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Unable to load calendar events');
      return response.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const eventsByDate = useMemo(() => {
    const map: Record<string, any> = {};
    (calendarData?.events || []).forEach((event: any) => {
      const dateKey = new Date(event.start_time).toISOString().split('T')[0];
      map[dateKey] = event;
    });
    return map;
  }, [calendarData]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, index) => {
    const dayNumber = index - firstDayOfMonth + 1;
    const isCurrentMonth = index >= firstDayOfMonth;
    const dateKey = isCurrentMonth
      ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
      : null;

    return {
      dayNumber: isCurrentMonth ? dayNumber : null,
      isCurrentMonth,
      event: dateKey ? eventsByDate[dateKey] : null,
    };
  });

  const previousMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ color: '#6366f1' }} />
          Team Leave Calendar
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#ffffff', p: 0.5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <IconButton size="small" onClick={previousMonth} disabled={isLoading}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', px: 2, minWidth: 120, textAlign: 'center' }}>
            {currentMonthName} {currentYear}
          </Typography>
          <IconButton size="small" onClick={nextMonth} disabled={isLoading}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Card sx={{ ...commonCardStyles, p: 2 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Grid container sx={{ borderBottom: '1px solid #f1f5f9' }}>
            {daysOfWeek.map((day, i) => (
              <Grid item xs={12/7} key={i}>
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    {day}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container>
            {calendarDays.map((day, i) => (
              <Grid item xs={12/7} key={i} sx={{ borderRight: (i + 1) % 7 !== 0 ? '1px solid #f8fafc' : 'none', borderBottom: i < firstDayOfMonth + daysInMonth - 7 ? '1px solid #f8fafc' : 'none' }}>
                <Box sx={{
                  height: 120,
                  p: 1.5,
                  bgcolor: day.isCurrentMonth ? '#ffffff' : '#f8fafc',
                  opacity: day.isCurrentMonth ? 1 : 0.5,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography sx={{
                    fontWeight: 600,
                    color: day.isCurrentMonth && day.dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() ? '#ffffff' : '#475569',
                    bgcolor: day.isCurrentMonth && day.dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() ? '#6366f1' : 'transparent',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    mb: 1
                  }}>
                    {day.isCurrentMonth ? day.dayNumber : ''}
                  </Typography>

                  {isLoading ? (
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>Loading events…</Typography>
                  ) : day.event ? (
                    <Box sx={{
                      bgcolor: day.event.color ? `rgba(${parseInt(day.event.color.slice(1, 3), 16)}, ${parseInt(day.event.color.slice(3, 5), 16)}, ${parseInt(day.event.color.slice(5, 7), 16)}, 0.12)` : '#f8fafc',
                      color: day.event.color || '#475569',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {day.event.title}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#cbd5e1', fontSize: '0.75rem' }}>No events</Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Sick Leave</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Paid Leave</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Holiday</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 3 }}>
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Live calendar data</Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
          Calendar events are loaded from the dashboard API for the selected month.
        </Typography>
      </Box>
    </Box>
  );
}
