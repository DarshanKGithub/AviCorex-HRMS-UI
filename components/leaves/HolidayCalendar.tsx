"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, Event as RbcEvent, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { API_BASE_URL } from '@/lib/apiBase';

// RBC Styles injection (SaaS Modern overrides)
const rbcStyles = `
  .rbc-calendar { font-family: 'Inter', 'Roboto', sans-serif; }
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view { 
    border: 1px solid #e2e8f0; 
    border-radius: 16px; 
    overflow: hidden; 
    background: #ffffff; 
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04); 
  }
  .rbc-header { 
    padding: 16px 8px; 
    font-weight: 700; 
    color: #64748b; 
    border-bottom: 1px solid #e2e8f0; 
    text-transform: uppercase; 
    font-size: 0.8rem; 
    background: #f8fafc; 
    letter-spacing: 0.05em;
  }
  .rbc-header + .rbc-header { border-left: 1px solid #e2e8f0; }
  .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #e2e8f0; }
  .rbc-month-row + .rbc-month-row { border-top: 1px solid #e2e8f0; }
  .rbc-date-cell { padding: 12px 12px 4px 12px; font-weight: 600; color: #334155; text-align: center; font-size: 0.9rem; }
  .rbc-off-range-bg { background: #fdfdfd; }
  .rbc-off-range .rbc-date-cell { color: #cbd5e1; font-weight: 500; }
  .rbc-today { background: #ffffff; }
  .rbc-today .rbc-date-cell { 
    color: #6366f1; 
    font-weight: 800; 
  }
  .rbc-event { 
    background: rgba(99, 102, 241, 0.1); 
    border: 1px solid rgba(99, 102, 241, 0.2); 
    color: #4338ca; 
    border-radius: 8px; 
    font-size: 0.75rem; 
    font-weight: 600; 
    padding: 4px 8px; 
    box-shadow: none; 
    margin: 2px 4px;
    transition: all 0.2s;
  }
  .rbc-event:hover {
    background: rgba(99, 102, 241, 0.15);
    transform: translateY(-1px);
  }
  .rbc-event:focus { outline: none; }
  .rbc-event.rbc-selected { background: rgba(99, 102, 241, 0.25); border-color: rgba(99, 102, 241, 0.4); }
  .rbc-row-segment { padding: 0; }
  .rbc-time-header.rbc-overflowing { border-right: none; }
  .rbc-time-header-content { border-left: 1px solid #e2e8f0; }
  .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9; }
  .rbc-time-content { border-top: 1px solid #e2e8f0; }
  .rbc-day-slot .rbc-time-slot { border-top: 1px solid #f8fafc; }
`;

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export type HolidayEvent = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

export default function HolidayCalendar({ events }: { events?: HolidayEvent[] }) {
  const { token, status } = useAuth();
  const { hasPermission } = usePermissions();
  const canManageHolidays = hasPermission('approve_leave');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>('month');

  // sanitize incoming events and keep local editable copy
  const sanitize = useCallback((src: HolidayEvent[] | undefined) => {
    const now = new Date();
    const year = now.getFullYear();

    if (!src || src.length === 0) {
      return [
        { title: 'New Year', start: new Date(year, 0, 1), end: new Date(year, 0, 1), allDay: true },
        { title: 'Labor Day', start: new Date(year, 4, 1), end: new Date(year, 4, 1), allDay: true },
        { title: 'Independence Day', start: new Date(year, 6, 4), end: new Date(year, 6, 4), allDay: true }
      ];
    }

    // ensure proper Date objects and end >= start
    return src
      .map((e) => {
        const start = e.start instanceof Date ? e.start : new Date(e.start as any);
        const end = e.end instanceof Date ? e.end : new Date(e.end as any);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        const safeEnd = end < start ? start : end;
        return { ...e, start, end: safeEnd } as HolidayEvent;
      })
      .filter(Boolean) as HolidayEvent[];
  }, []);

  const [items, setItems] = useState<HolidayEvent[]>(() => sanitize(events));
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const now = new Date();
  const currentYear = now.getFullYear();

  // Build years list from 1900 up to a future buffer (currentYear + 10)
  const years = useMemo(() => {
    const start = 1900;
    const end = currentYear + 10;
    const list: number[] = [];
    for (let y = end; y >= start; y--) list.push(y);
    return list;
  }, [currentYear]);

  const months = useMemo(
    () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    []
  );

  // Dialog state for adding events
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogAllDay, setDialogAllDay] = useState(true);

  const onNavigate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    setCurrentDate(d);
  };

  const onSelectSlot = (slotInfo: SlotInfo) => {
    if (!canManageHolidays) return;
    setSelectedSlot(slotInfo);
    setDialogTitle('');
    setDialogAllDay(true);
    setDialogOpen(true);
  };

  const handleDialogSave = async () => {
    if (!selectedSlot) return setDialogOpen(false);
    const title = dialogTitle.trim();
    if (!title) return;

    const start = selectedSlot.start instanceof Date ? selectedSlot.start : new Date(selectedSlot.start as any);
    const end = selectedSlot.end instanceof Date ? selectedSlot.end : new Date(selectedSlot.end as any);
    const newEvent: HolidayEvent = { title, start, end: end < start ? start : end, allDay: dialogAllDay };

    if (!token) {
      setError('Please login again to add holidays.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/leave/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newEvent.title,
          holiday_date: format(newEvent.start, 'yyyy-MM-dd'),
          is_public: true,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.detail || 'Unable to save holiday.');
        return;
      }

      const payload = await res.json();
      setItems((prev) => [
        ...prev,
        {
          id: payload.id,
          title: payload.name,
          start: new Date(payload.holiday_date),
          end: new Date(payload.holiday_date),
          allDay: true,
        },
      ]);
      setDialogOpen(false);
      setSelectedSlot(null);
      setDialogTitle('');
    } catch (err) {
      setError('Network error while saving holiday.');
    } finally {
      setSaving(false);
    }
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setSelectedSlot(null);
  };

  const onSelectEvent = (event: RbcEvent) => {
    if (!canManageHolidays) return;
    const keep = window.confirm(`Delete holiday "${(event as any).title}"? Click OK to delete.`);
    if (!keep) return;

    const holidayEvent = event as HolidayEvent;
    if (!holidayEvent.id || !token) {
      setItems((prev) => prev.filter((e) => !(e.title === (event as any).title && +e.start === +((event as any).start))));
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/leave/holidays/${holidayEvent.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setError(payload?.detail || 'Unable to delete holiday.');
          return;
        }
        setItems((prev) => prev.filter((e) => e.id !== holidayEvent.id));
      } catch {
        setError('Network error while deleting holiday.');
      }
    })();
  };

  useEffect(() => {
    if (status !== 'ready' || !token) return;

    const load = async () => {
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/leave/holidays?year=${currentDate.getFullYear()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setError(payload?.detail || 'Unable to load holidays.');
          return;
        }

        const payload = await res.json();
        if (Array.isArray(payload) && payload.length > 0) {
          setItems(
            payload.map((holiday) => ({
              id: holiday.id,
              title: holiday.name,
              start: new Date(holiday.holiday_date),
              end: new Date(holiday.holiday_date),
              allDay: true,
            }))
          );
        }
      } catch {
        setError('Network error while loading holidays.');
      }
    };

    void load();
  }, [token, status, currentDate]);

  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const currentMonthNameDisplay = currentDate.toLocaleString('default', { month: 'long' });
  const currentYearDisplay = currentDate.getFullYear();

  return (
    <Box sx={{ pb: 8 }}>
      <style>{rbcStyles}</style>
      
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Modern Toolbar */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
        
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="month-select-label" sx={{ fontWeight: 600 }}>Month</InputLabel>
            <Select
              labelId="month-select-label"
              value={currentDate.getMonth()}
              label="Month"
              onChange={(e) => {
                const m = Number(e.target.value);
                setCurrentDate(new Date(currentDate.getFullYear(), m, 1));
              }}
              sx={{ borderRadius: 2, bgcolor: '#ffffff' }}
            >
              {months.map((m, idx) => (
                <MenuItem key={m} value={idx}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="year-select-label" sx={{ fontWeight: 600 }}>Year</InputLabel>
            <Select
              labelId="year-select-label"
              value={currentDate.getFullYear()}
              label="Year"
              onChange={(e) => {
                const y = Number(e.target.value);
                setCurrentDate(new Date(y, currentDate.getMonth(), 1));
              }}
              sx={{ borderRadius: 2, bgcolor: '#ffffff' }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {!canManageHolidays && (
            <Box sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, pl: 1 }}>Read-only</Box>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2.5}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            size="small"
            sx={{ 
              bgcolor: '#f1f5f9', 
              p: 0.5,
              borderRadius: 2.5,
              display: { xs: 'none', sm: 'flex' },
              '& .MuiToggleButton-root': { 
                py: 0.8, 
                px: 2,
                border: 'none',
                borderRadius: 2,
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
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
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
          </ToggleButtonGroup>

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
                bgcolor: '#ffffff',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
              }}
            >
              Today
            </Button>
            <Stack direction="row" alignItems="center" sx={{ bgcolor: '#ffffff', p: 0.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <IconButton size="small" onClick={goToPrevious} sx={{ color: '#64748b' }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', px: 2, minWidth: 140, textAlign: 'center' }}>
                {view === 'month' ? `${currentMonthNameDisplay} ${currentYearDisplay}` : format(currentDate, 'MMM d, yyyy')}
              </Typography>
              <IconButton size="small" onClick={goToNext} sx={{ color: '#64748b' }}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

      </Stack>

      <Box sx={{ height: '720px' }}>
        <Calendar
          localizer={localizer}
          events={items as RbcEvent[]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          view={view}
          date={currentDate}
          onNavigate={onNavigate}
          onView={(newView) => setView(newView)}
          selectable={canManageHolidays}
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          showMultiDayTimes
          popup
          toolbar={false} // Disable default RBC toolbar
        />
      </Box>

      {/* Dialog for adding holiday */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Add Holiday</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Holiday Title" 
              value={dialogTitle} 
              onChange={(e) => setDialogTitle(e.target.value)} 
              fullWidth 
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControlLabel 
              control={<Checkbox checked={dialogAllDay} onChange={(e) => setDialogAllDay(e.target.checked)} sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }} />} 
              label={<Typography sx={{ fontWeight: 600, color: '#475569' }}>All-day Event</Typography>} 
            />
            {selectedSlot ? (
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>Selected Date Range</Typography>
                <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>
                  {format(new Date(selectedSlot.start), 'MMM d, yyyy')}
                  {new Date(selectedSlot.start).getTime() !== new Date(selectedSlot.end).getTime() && ` - ${format(new Date(selectedSlot.end), 'MMM d, yyyy')}`}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleDialogCancel} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => void handleDialogSave()} 
            disabled={!dialogTitle.trim() || saving}
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
            {saving ? 'Saving...' : 'Save Holiday'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
