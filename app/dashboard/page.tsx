'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Grid, Skeleton, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance, isLoading: loading, error: fetchError } = useQuery<AttendanceRecord | null>({
    queryKey: ['attendance', employeeId, today],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${employeeId}&start_date=${today}&end_date=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Unable to load attendance status right now.');
      const data = await response.json();
      return data.items?.[0] ?? null;
    },
    enabled: status === 'ready' && !!token && !!user && !!employeeId,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
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

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Attendance marked only after your click.');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to check in');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
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

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Checked out only after your click.');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to check out');
    }
  });
  
  const handleCheckIn = () => checkInMutation.mutate();
  const handleCheckOut = () => checkOutMutation.mutate();
  const checking = checkInMutation.isPending || checkOutMutation.isPending;
  const displayError = error || (fetchError instanceof Error ? fetchError.message : null);


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
      <Box sx={{ fontSize: 18, fontWeight: 900, mb: 1 }}>{loading ? <Skeleton width={100} sx={{ mx: 'auto' }} /> : 'Manual only'}</Box>
      <Box sx={{ color: 'text.secondary', fontSize: 12, mb: 2, lineHeight: 1.6 }}>
        Attendance stays pending until you click the button below.
      </Box>
      <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
        {checkInLabel}
      </Box>
      <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: alpha('#f97316', 0.1), color: '#f97316', fontWeight: 700, fontSize: 12, mb: 1.5 }}>
        {checkOutLabel}
      </Box>
      {displayError && (
        <Alert severity="error" sx={{ mb: 1.5, textAlign: 'left' }}>
          {displayError}
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
            <Box sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <Skeleton variant="rounded" height={100} />
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <Skeleton variant="rounded" height={250} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Skeleton variant="rounded" height={250} />
                  </Grid>
                </Grid>
                <Skeleton variant="rounded" height={150} />
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
