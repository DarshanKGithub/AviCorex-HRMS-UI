'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, Paper, Stack, Typography, Alert } from '@mui/material';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { iconMap } from '@/components/shell/iconMapping';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';

type ServiceItem = {
  key: string;
  label: string;
  icon: string;
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { key: 'manage-accounts', label: 'Manage Accounts', icon: 'people' },
  { key: 'onboarding', label: 'Onboarding', icon: 'engage' },
  { key: 'employee-info', label: 'Employee Information', icon: 'employees' },
  { key: 'leave-tracker', label: 'Leave Tracker', icon: 'leave' },
  { key: 'attendance', label: 'Attendance', icon: 'attendance' },
  { key: 'shifts', label: 'Shifts', icon: 'calendar' },
  { key: 'time-tracker', label: 'Time Tracker', icon: 'attendance' },
  { key: 'performance', label: 'Performance', icon: 'performance' },
  { key: 'files', label: 'Files', icon: 'docs' },
  { key: 'employee-engagement', label: 'Employee Engagement', icon: 'engagement' },
  { key: 'hr-letters', label: 'HR Letters', icon: 'docs' },
  { key: 'travel', label: 'Travel', icon: 'worklife' },
  { key: 'tasks', label: 'Tasks', icon: 'todo' },
  { key: 'compensation', label: 'Compensation', icon: 'payroll' },
  { key: 'general', label: 'General', icon: 'settings' },
  { key: 'offboarding', label: 'Offboarding', icon: 'workflow' },
  { key: 'marketplace', label: 'Marketplace', icon: 'dashboard' },
  { key: 'developer-space', label: 'Developer Space', icon: 'helpdesk' },
  { key: 'zia', label: 'Zia', icon: 'worklife' }
];

function readServices(): ServiceItem[] {
  if (typeof window === 'undefined') return DEFAULT_SERVICES;
  try {
    const raw = window.localStorage.getItem('hrms_services');
    if (!raw) return DEFAULT_SERVICES;
    const parsed = JSON.parse(raw) as ServiceItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SERVICES;
  } catch {
    return DEFAULT_SERVICES;
  }
}

export default function ServicesPage() {
  const router = useRouter();
  const { status, isAuthenticated, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  const isAdmin = hasPermission('manage_settings');

  useEffect(() => {
    setServices(readServices());
  }, []);

  const serviceCards = useMemo(() => services, [services]);

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, status]);

  if (status === 'loading' || !isAuthenticated || !user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">This section is available to admin users only.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2 }} />
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
          Services
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Manage service modules from one place. Click any tile to edit it or use Add Service to create a new one.
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        {serviceCards.map((service) => {
          const Icon = iconMap[service.icon] || BusinessCenterRoundedIcon;

          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={service.key}>
              <Paper
                elevation={0}
                onClick={() => router.push(`/services/${service.key}`)}
                sx={{
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: 3,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  minHeight: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.35)', transform: 'translateY(-2px)' }
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <Box sx={{ width: 72, height: 72, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'background.paper', border: '1px solid #eef2f7' }}>
                    <Icon sx={{ fontSize: 30, color: '#7C3AED' }} />
                  </Box>
                  <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600 }}>{service.label}</Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}

        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Paper
            elevation={0}
            onClick={() => router.push('/services/new')}
            sx={{
              cursor: 'pointer',
              p: 2,
              borderRadius: 3,
              textAlign: 'center',
              border: '1px dashed #c4b5fd',
              minHeight: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f8fbff',
              '&:hover': { boxShadow: '0 12px 28px -18px rgba(124, 58, 237, 0.35)' }
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <Box sx={{ width: 72, height: 72, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'background.paper', border: '2px solid #7C3AED', color: '#7C3AED', fontSize: 30, fontWeight: 700 }}>
                +
              </Box>
              <Typography sx={{ fontSize: 13, color: '#6d28d9', fontWeight: 700 }}>Add Service</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
