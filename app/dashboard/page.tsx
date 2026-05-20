'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { ActivitiesSection } from '@/components/dashboard/ActivitiesSection';
import { CalendarSection } from '@/components/dashboard/CalendarSection';
import { DelegationSection, DashboardDetailSection } from '@/components/dashboard/DelegationSection';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

type AttendanceRecord = {
  attendance_date: string;
  check_in_time: string | null;
  check_out_time?: string | null;
};

// AttendanceWidget component - sidebar stats
function AttendanceWidget() {
  const theme = useTheme();
  const { token, user, status } = useAuth();
  const employeeId = useEmployeeId();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a78bfa', 0.2) : '#e2e8f0';
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'ready' || !token || !user) return;

    const controller = new AbortController();

    async function fetchTodayAttendance() {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `${API_BASE_URL}/attendance?employee_id=${employeeId}&start_date=${today}&end_date=${today}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTodayAttendance(data.items?.[0] ?? null);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Failed to load dashboard attendance:', fetchError);
          setError('Unable to load attendance status right now.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTodayAttendance();

    return () => controller.abort();
  }, [employeeId, status, token, user]);

  async function handleCheckIn() {
    if (!token || !user || !employeeId) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_in_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check in');
      }

      const data = await response.json();
      setTodayAttendance({
        attendance_date: data.attendance_date,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time ?? null,
      });
      setSuccess('Attendance marked only after your click.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Failed to check in');
    } finally {
      setChecking(false);
    }
  }

  async function handleCheckOut() {
    if (!token || !user || !employeeId || !todayAttendance?.check_in_time) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_out_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check out');
      }

      const data = await response.json();
      setTodayAttendance({
        attendance_date: data.attendance_date,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time ?? null,
      });
      setSuccess('Checked out only after your click.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (checkOutError) {
      setError(checkOutError instanceof Error ? checkOutError.message : 'Failed to check out');
    } finally {
      setChecking(false);
    }
  }

  const checkInLabel = todayAttendance?.check_in_time
    ? `Checked in at ${new Date(todayAttendance.check_in_time).toLocaleTimeString()}`
    : 'Not checked in yet';

  const checkOutLabel = todayAttendance?.check_out_time
    ? `Checked out at ${new Date(todayAttendance.check_out_time).toLocaleTimeString()}`
    : 'Not checked out yet';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: panelBg,
        border: `1px solid ${panelBorder}`,
        textAlign: 'center',
      }}
    >
      <Box sx={{ fontSize: 40, mb: 1 }}>📍</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Attendance Check-in</Box>
      <Box sx={{ fontSize: 18, fontWeight: 900, mb: 1 }}>{loading ? 'Loading...' : 'Manual only'}</Box>
      <Box sx={{ color: 'text.secondary', fontSize: 12, mb: 2, lineHeight: 1.6 }}>
        Attendance stays pending until you click the button below.
      </Box>
      <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
        {checkInLabel}
      </Box>
      <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: alpha('#f97316', 0.1), color: '#f97316', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
        {checkOutLabel}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, textAlign: 'left' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 1.5, textAlign: 'left' }}>
          {success}
        </Alert>
      )}
      <Button
        fullWidth
        variant="contained"
        onClick={handleCheckIn}
        disabled={loading || checking || !!todayAttendance?.check_in_time}
        sx={{
          borderRadius: 999,
          py: 1.1,
          fontWeight: 800,
          textTransform: 'none',
          bgcolor: '#0f172a',
          '&:hover': { bgcolor: '#111827' },
          '&.Mui-disabled': {
            bgcolor: alpha('#94a3b8', 0.25),
            color: 'text.secondary',
          },
        }}
      >
        {checking ? 'Checking in...' : todayAttendance?.check_in_time ? 'Already checked in' : 'Click to Check In'}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleCheckOut}
        disabled={loading || checking || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
        sx={{
          mt: 1,
          borderRadius: 999,
          py: 1.1,
          fontWeight: 800,
          textTransform: 'none',
          borderColor: alpha('#f97316', 0.35),
          color: '#f97316',
          '&:hover': {
            borderColor: '#f97316',
            bgcolor: alpha('#f97316', 0.08),
          },
          '&.Mui-disabled': {
            borderColor: alpha('#94a3b8', 0.25),
            color: 'text.secondary',
          },
        }}
      >
        {checking
          ? 'Checking out...'
          : todayAttendance?.check_out_time
            ? 'Already checked out'
            : 'Click to Check Out'}
      </Button>
    </Box>
  );
}

// Main Dashboard Content
function DashboardContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentSection, isLoading } = useDashboard();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <DashboardNavigation />
      </Box>

      {/* Main Grid */}
      <Grid container spacing={2.5}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <AttendanceWidget />
        </Grid>

        {/* Right Content */}
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={40} />
              </Stack>
            </Box>
          ) : (
            <>
              {currentSection === 'overview' && <OverviewSection />}
              {currentSection === 'dashboard' && <DashboardDetailSection />}
              {currentSection === 'calendar' && <CalendarSection />}
              {currentSection === 'delegation' && <DelegationSection />}
              {currentSection === 'activities' && <ActivitiesSection />}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// Main export with provider
export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
