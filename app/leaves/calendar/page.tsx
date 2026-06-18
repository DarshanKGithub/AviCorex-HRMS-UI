'use client';

import React, { useMemo, useState } from 'react';
import { Box, Typography, Stack, Grid, IconButton, ToggleButtonGroup, ToggleButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';
import format from 'date-fns/format';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE_URL = getApiBaseUrl();

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LeaveCalendarPage() {
  const { user, token, status } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'personal' | 'team'>('personal');

  const role = user?.role || 'Employee';
  const canViewTeam = ['Manager', 'HR', 'Admin'].includes(role);
  const canAddHoliday = ['Manager', 'HR', 'Admin'].includes(role); // Allow adding holidays

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });

  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendarEvents', startDate, endDate, viewType],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/calendar/events?start_date=${startDate}&end_date=${endDate}&view_type=${viewType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Unable to load calendar events');
      return response.json();
    },
    enabled: status === 'ready' && !!token,
  });

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    (calendarData?.events || []).forEach((event: any) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      
      let current = new Date(start);
      current.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      while (current <= endDay) {
        const dateKey = current.toISOString().split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [calendarData]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const calendarDays = Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - firstDayOfMonth + 1;
    const isCurrentMonth = index >= firstDayOfMonth && dayNumber <= daysInMonth;
    const dateKey = isCurrentMonth
      ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
      : null;

    return {
      dayNumber: isCurrentMonth ? dayNumber : null,
      isCurrentMonth,
      dateKey,
      events: dateKey ? (eventsByDate[dateKey] || []) : [],
    };
  });

  const previousMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDateClick = (dateKey: string | null) => {
    if (!canAddHoliday || !dateKey) return;
    setSelectedDateKey(dateKey);
    setDialogTitle('');
    setDialogOpen(true);
  };

  const handleSaveHoliday = async () => {
    if (!selectedDateKey || !dialogTitle.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/leave/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: dialogTitle.trim(),
          holiday_date: selectedDateKey,
          is_public: true,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
        setDialogOpen(false);
      } else {
        alert('Failed to save holiday.');
      }
    } catch (err) {
      alert('Network error while saving holiday.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#fcfcfd' }}>
      <Breadcrumbs />
      
      {/* Header Section */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4, mt: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarMonthIcon sx={{ color: '#6366f1', fontSize: 32 }} />
            Leave Calendar
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
            Track and manage team availability and holidays.
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={2.5}>
          {canViewTeam && (
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(_, val) => val && setViewType(val)}
              size="small"
              sx={{ 
                bgcolor: '#f1f5f9', 
                p: 0.5,
                borderRadius: 2.5,
                '& .MuiToggleButton-root': { 
                  py: 0.8, 
                  px: 2.5,
                  border: 'none',
                  borderRadius: 2,
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  },
                  '&:hover': { bgcolor: 'transparent', color: '#0f172a' },
                  '&.Mui-selected:hover': { bgcolor: '#ffffff' }
                } 
              }}
            >
              <ToggleButton value="personal">My Leaves</ToggleButton>
              <ToggleButton value="team">Team Leaves</ToggleButton>
            </ToggleButtonGroup>
          )}

          <Stack direction="row" alignItems="center" spacing={1}>
            <Button 
              variant="outlined" 
              onClick={goToToday}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                borderColor: '#e2e8f0', 
                color: '#334155',
                borderRadius: 2,
                px: 2,
                mr: 1,
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
              }}
            >
              Today
            </Button>
            <Stack direction="row" alignItems="center" sx={{ bgcolor: '#ffffff', p: 0.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <IconButton size="small" onClick={previousMonth} disabled={isLoading} sx={{ color: '#64748b' }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', px: 2, minWidth: 140, textAlign: 'center' }}>
                {currentMonthName} {currentYear}
              </Typography>
              <IconButton size="small" onClick={nextMonth} disabled={isLoading} sx={{ color: '#64748b' }}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Calendar Grid */}
      <Box sx={{ 
        bgcolor: '#ffffff', 
        borderRadius: 4, 
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.04)'
      }}>
        {/* Days Header */}
        <Grid container sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          {daysOfWeek.map((day, i) => (
            <Grid item xs={12/7} key={i}>
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Days Grid */}
        <Grid container>
          {calendarDays.map((day, i) => {
            const isToday = day.isCurrentMonth && day.dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            
            return (
              <Grid item xs={12/7} key={i} 
                onClick={() => handleDateClick(day.dateKey)}
                sx={{ 
                borderRight: (i + 1) % 7 !== 0 ? '1px solid #e2e8f0' : 'none', 
                borderBottom: i < calendarDays.length - 7 ? '1px solid #e2e8f0' : 'none',
                bgcolor: day.isCurrentMonth ? '#ffffff' : '#f8fafc',
                minHeight: 160,
                cursor: (canAddHoliday && day.isCurrentMonth) ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: day.isCurrentMonth ? '#fdfdff' : '#f8fafc' }
              }}>
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                    <Typography sx={{
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? '#ffffff' : (day.isCurrentMonth ? '#334155' : '#cbd5e1'),
                      bgcolor: isToday ? '#6366f1' : 'transparent',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '0.9rem',
                      boxShadow: isToday ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                    }}>
                      {day.dayNumber || ''}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' } }}>
                    {isLoading ? (
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>...</Typography>
                    ) : day.events.length > 0 ? (
                      <Stack spacing={1}>
                        {day.events.slice(0, 3).map((evt: any, idx: number) => (
                          <Tooltip key={idx} title={evt.title + (evt.description ? ` - ${evt.description}` : '')} arrow placement="top" disableInteractive>
                            <Box sx={{
                              bgcolor: evt.color ? `${evt.color}15` : '#f8fafc',
                              color: evt.color || '#475569',
                              px: 1.2,
                              py: 0.6,
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              border: `1px solid ${evt.color ? evt.color + '30' : '#e2e8f0'}`,
                              transition: 'all 0.2s',
                              '&:hover': { filter: 'brightness(0.95)', transform: 'translateY(-1px)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                            }}>
                              {evt.title}
                            </Box>
                          </Tooltip>
                        ))}
                        {day.events.length > 3 && (
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, pl: 0.5, pt: 0.5, textAlign: 'center' }}>
                            +{day.events.length - 3} more
                          </Typography>
                        )}
                      </Stack>
                    ) : null}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 4, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#4dabf7' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>My Leaves</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#928ddd' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Team Leaves</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#ff6b6b' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Holiday</Typography>
        </Box>
      </Box>

      {/* Add Holiday Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Add Holiday</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Holiday / Event Title" 
              value={dialogTitle} 
              onChange={(e) => setDialogTitle(e.target.value)} 
              fullWidth 
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {selectedDateKey ? (
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Selected Date</Typography>
                <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>
                  {format(new Date(selectedDateKey), 'EEEE, MMMM do, yyyy')}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => void handleSaveHoliday()} 
            disabled={!dialogTitle.trim() || isSaving}
            sx={{ 
              bgcolor: '#6366f1', 
              color: '#ffffff', 
              fontWeight: 600, 
              borderRadius: 2, 
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {isSaving ? 'Saving...' : 'Save Holiday'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
