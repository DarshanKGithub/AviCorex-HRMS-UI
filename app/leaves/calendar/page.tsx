'use client';

import { Box, Card, CardContent, Typography, Stack, Grid, IconButton, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const commonCardStyles = {
  borderRadius: 4,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  bgcolor: '#ffffff',
  height: '100%'
};

export default function LeaveCalendarPage() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generating a simple 35-day grid for UI purposes (mock calendar)
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const isCurrentMonth = i >= 3 && i < 34; // Mocking a 31-day month that starts on Wednesday
    const dayNumber = isCurrentMonth ? i - 2 : (i < 3 ? 28 + i : i - 33);
    
    // Mock events
    let event = null;
    if (isCurrentMonth) {
      if (dayNumber === 15) event = { type: 'holiday', title: 'Public Holiday', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      if (dayNumber === 22 || dayNumber === 23) event = { type: 'leave', title: 'John Doe (SL)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      if (dayNumber === 8) event = { type: 'leave', title: 'Jane Smith (PL)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    }
    
    return { dayNumber, isCurrentMonth, event };
  });

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ color: '#6366f1' }} /> 
          Team Leave Calendar
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#ffffff', p: 0.5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <IconButton size="small"><ChevronLeftIcon /></IconButton>
          <Typography sx={{ fontWeight: 700, color: '#1e293b', px: 2, minWidth: 120, textAlign: 'center' }}>
            {currentMonthName} {currentYear}
          </Typography>
          <IconButton size="small"><ChevronRightIcon /></IconButton>
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
              <Grid item xs={12/7} key={i} sx={{ borderRight: (i + 1) % 7 !== 0 ? '1px solid #f8fafc' : 'none', borderBottom: i < 28 ? '1px solid #f8fafc' : 'none' }}>
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
                    color: day.dayNumber === currentDate.getDate() && day.isCurrentMonth ? '#ffffff' : '#475569',
                    bgcolor: day.dayNumber === currentDate.getDate() && day.isCurrentMonth ? '#6366f1' : 'transparent',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    mb: 1
                  }}>
                    {day.dayNumber}
                  </Typography>
                  
                  {day.event && (
                    <Box sx={{ 
                      bgcolor: day.event.bg, 
                      color: day.event.color, 
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
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Note:</Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mt: 1 }}>
          This is a simulated calendar view. Once the backend endpoint for the team leave calendar is available, this page will reflect real-time team availability and holidays.
        </Typography>
      </Box>
    </Box>
  );
}
