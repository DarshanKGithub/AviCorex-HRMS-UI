'use client';

import React from 'react';
import { Box, Grid, useTheme, CircularProgress, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { ActivitiesSection } from '@/components/dashboard/ActivitiesSection';
import { CalendarSection } from '@/components/dashboard/CalendarSection';
import { DelegationSection, DashboardDetailSection } from '@/components/dashboard/DelegationSection';
import { useAuth } from '@/components/auth/AuthContext';

// AttendanceWidget component - sidebar stats
function AttendanceWidget() {
  const theme = useTheme();
  const { token } = useAuth();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a78bfa', 0.2) : '#e2e8f0';

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
      <Box sx={{ fontSize: 18, fontWeight: 900, mb: 2 }}>Active</Box>
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: 12 }}>
        ✓ Checked in today
      </Box>
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
