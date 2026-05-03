"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, Event as RbcEvent } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export type HolidayEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

export default function HolidayCalendar({ events }: { events?: HolidayEvent[] }) {
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
        // ensure end is not before start
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
    const end = currentYear + 10; // configurable future buffer
    const list: number[] = [];
    for (let y = end; y >= start; y--) list.push(y);
    return list;
  }, [currentYear]);

  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    []
  );

  // Dialog state for adding events (replaces window.prompt)
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogAllDay, setDialogAllDay] = useState(false);

  // handle navigation (month/week/day) — allows navigating to any past/future date
  const onNavigate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    setCurrentDate(d);
  };

  // user can select a range/slot to add a holiday — open modal to enter details
  const onSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setDialogTitle('');
    setDialogAllDay(false);
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!selectedSlot) return setDialogOpen(false);
    const title = dialogTitle.trim();
    if (!title) return; // require title

    const start = selectedSlot.start instanceof Date ? selectedSlot.start : new Date(selectedSlot.start as any);
    const end = selectedSlot.end instanceof Date ? selectedSlot.end : new Date(selectedSlot.end as any);
    const newEvent: HolidayEvent = { title, start, end: end < start ? start : end, allDay: dialogAllDay };
    setItems((prev) => [...prev, newEvent]);
    setDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setSelectedSlot(null);
  };

  // selecting an existing event offers deletion (simple inline flow)
  const onSelectEvent = (event: RbcEvent) => {
    const keep = window.confirm(`Delete event "${(event as any).title}"? Click OK to delete.`);
    if (keep) {
      setItems((prev) => prev.filter((e) => !(e.title === (event as any).title && +e.start === +((event as any).start))));
    }
  };

  const sampleEvents = items;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            value={currentDate.getFullYear()}
            label="Year"
            onChange={(e) => {
              const y = Number(e.target.value);
              // navigate to January 1st of selected year
              const newDate = new Date(y, currentDate.getMonth(), 1);
              setCurrentDate(newDate);
            }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            value={currentDate.getMonth()}
            label="Month"
            onChange={(e) => {
              const m = Number(e.target.value);
              const newDate = new Date(currentDate.getFullYear(), m, 1);
              setCurrentDate(newDate);
            }}
          >
            {months.map((m, idx) => (
              <MenuItem key={m} value={idx}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button size="small" onClick={() => setCurrentDate(new Date())}>Today</Button>
      </Stack>

      <Box sx={{ height: '720px' }}>
      <Calendar
        localizer={localizer}
        events={sampleEvents as RbcEvent[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={{ month: true, week: true, day: true }}
        defaultView="month"
        date={currentDate}
        onNavigate={onNavigate}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        showMultiDayTimes
        popup
      />
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogCancel} fullWidth maxWidth="sm">
        <DialogTitle>Add Holiday</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={dialogTitle} onChange={(e) => setDialogTitle(e.target.value)} fullWidth />
            <FormControlLabel control={<Checkbox checked={dialogAllDay} onChange={(e) => setDialogAllDay(e.target.checked)} />} label="All day" />
            {selectedSlot ? (
              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Dates: {new Date(selectedSlot.start).toLocaleString()} → {new Date(selectedSlot.end).toLocaleString()}
              </div>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSave} disabled={!dialogTitle.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
