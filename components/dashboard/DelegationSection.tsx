'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Chip, Alert, Skeleton, Grid, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import FolderIcon from '@mui/icons-material/Folder';
import CampaignIcon from '@mui/icons-material/Campaign';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useAuth } from '@/components/auth/AuthContext';
import { useDashboard } from './DashboardContext';
import { getApiBaseUrl } from '@/lib/apiBase';

export function DelegationSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { refreshKey } = useDashboard();
  const API_BASE = getApiBaseUrl();

  const [delegationData, setDelegationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a855f7', 0.2) : '#e2e8f0';

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/dashboard/delegation`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch delegation data');
        const data = await res.json();
        setDelegationData(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch:', err);
          setError(err.message || 'Failed to load delegation data');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [token, API_BASE, refreshKey]);

  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Pending Tasks', value: delegationData?.total_pending_tasks || 0, color: '#f59e0b' },
          { label: 'Overdue', value: delegationData?.overdue_tasks || 0, color: '#ef4444' },
          { label: 'Completed This Week', value: delegationData?.completed_this_week || 0, color: '#10b981' },
          { label: 'Completion Rate', value: `${(delegationData?.completion_rate || 0).toFixed(1)}%`, color: '#7C3AED' },
        ].map((item, idx) => (
          <Card key={idx} sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: item.color, mt: 0.75 }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tasks Lists */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
        {/* Delegated by me */}
        <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Delegated by Me</Typography>
            {delegationData?.delegated_by_me?.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No tasks delegated yet</Typography>
            ) : (
              <Stack spacing={1}>
                {delegationData?.delegated_by_me?.slice(0, 5).map((task: any) => (
                  <Box key={task.id} sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#8b5cf6', 0.08) }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{task.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      To: {task.delegated_to}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Delegated to me */}
        <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}` }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Delegated to Me</Typography>
            {delegationData?.delegated_to_me?.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No pending tasks</Typography>
            ) : (
              <Stack spacing={1}>
                {delegationData?.delegated_to_me?.slice(0, 5).map((task: any) => (
                  <Box key={task.id} sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#10b981', 0.08) }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{task.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      From: {task.delegated_by}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

export function DashboardDetailSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentSpace } = useDashboard();
  const { user } = useAuth();

  const panelBg = isDark ? alpha('#0f172a', 0.85) : '#ffffff';
  const panelBorder = isDark ? alpha('#a855f7', 0.2) : '#e2e8f0';

  const services = [
    { label: 'Onboarding', icon: ChecklistIcon, color: '#f59e0b', description: 'New hire setup and welcome flows.' },
    { label: 'Attendance', icon: ScheduleIcon, color: '#ef4444', description: 'Check-ins, shifts, and presence.' },
    { label: 'Performance', icon: WorkHistoryIcon, color: '#84cc16', description: 'Goals, reviews, and scorecards.' },
    { label: 'Employee Engagement', icon: CampaignIcon, color: '#ec4899', description: 'Announcements, feedback, and pulse.' },
    { label: 'Travel', icon: GroupsIcon, color: '#f97316', description: 'Business trips and travel requests.' },
    { label: 'Compensation', icon: TaskAltIcon, color: '#db2777', description: 'Payroll, benefits, and pay records.' },
    { label: 'Leave Tracker', icon: ScheduleIcon, color: '#38bdf8', description: 'Apply, review, and approve leave.' },
    { label: 'Time Tracker', icon: WorkHistoryIcon, color: '#f59e0b', description: 'Daily work logs and timesheets.' },
    { label: 'Files', icon: FolderIcon, color: '#38bdf8', description: 'Documents, policies, and uploads.' },
    { label: 'HR Letters', icon: ChecklistIcon, color: '#f97316', description: 'Letters, certificates, and templates.' },
    { label: 'Tasks', icon: TaskAltIcon, color: '#f97316', description: 'Delegations, approvals, and follow-ups.' },
    { label: 'General', icon: GroupsIcon, color: '#eab308', description: 'Shared tools and quick actions.' },
  ];

  return (
    <Stack spacing={2.5}>
      <Card
        sx={{
          bgcolor: panelBg,
          border: `1px solid ${panelBorder}`,
          backgroundImage: isDark
            ? 'linear-gradient(135deg, rgba(17,24,39,0.92) 0%, rgba(10,10,10,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: 'text.secondary' }}>
                {currentSpace === 'organization' ? 'Organization Overview' : 'My Space Overview'}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 900, mt: 0.5 }}>
                {currentSpace === 'organization'
                  ? 'Workspace services and team operations'
                  : `Good to see you, ${user?.full_name || 'there'}`}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 780 }}>
                {currentSpace === 'organization'
                  ? 'Use this workspace to manage onboarding, attendance, leaves, performance, documents, and daily operations in one place.'
                  : 'Track your day, check tasks, review attendance, and keep personal work actions close to your workflow.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={currentSpace === 'organization' ? 'Organization Mode' : 'My Space Mode'} sx={{ bgcolor: alpha('#8b5cf6', 0.14), color: '#8b5cf6', fontWeight: 700 }} />
              <Chip label="Live Data" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {currentSpace === 'organization' ? (
        <Grid container spacing={1.5}>
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <Grid item xs={12} md={6} key={item.label}>
                <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
                  <CardContent sx={{ p: 1.9 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 1.25, display: 'grid', placeItems: 'center', bgcolor: alpha(item.color, 0.15), color: item.color }}>
                        <Icon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800 }}>{item.label}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{item.description}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Today&apos;s Flow</Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#8b5cf6', 0.08) }}>
                    <Typography sx={{ fontWeight: 700 }}>Morning check-in</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Your workday status and attendance timer are shown on the left rail.</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.08) }}>
                    <Typography sx={{ fontWeight: 700 }}>Quick actions</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Jump into leaves, time logs, and approvals without leaving the dashboard.</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: panelBg, border: `1px solid ${panelBorder}`, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Quick Actions</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {['Check-in', 'Apply Leave', 'View Time Log', 'Open Files', 'Request Help'].map((action) => (
                    <Button key={action} variant="outlined" size="small" sx={{ borderRadius: 999, textTransform: 'none' }}>
                      {action}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
