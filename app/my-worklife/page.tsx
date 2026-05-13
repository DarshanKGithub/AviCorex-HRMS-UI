'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

export default function MyWorklifePage() {
  const { user } = useAuth();

  const quickLinks = [
    { label: 'My profile', href: '/profile', description: 'Update personal and job details.' },
    { label: 'Attendance', href: '/attendance', description: 'Clock in, clock out, and review time.' },
    { label: 'Leaves', href: '/leaves', description: 'Apply for leave and track balances.' },
    { label: 'Engage', href: '/engage', description: 'Catch up on announcements and tickets.' },
    { label: 'To Do', href: '/todo', description: 'Track personal priorities.' },
    { label: 'Helpdesk', href: '/helpdesk', description: 'Open support requests when needed.' },
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumbs />

      <Stack spacing={3}>
        <Box>
          <Chip label="My Worklife" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700 }} />
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Personal workspace
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 760 }}>
            One place for the things you use every day: personal details, attendance, leave, tasks, and support.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {[
            { label: 'Focus areas', value: '6', helper: 'Shortcuts and essentials' },
            { label: 'Today', value: new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), helper: 'Daily view' },
            { label: 'Status', value: user?.role || 'Employee', helper: 'Current workspace role' },
          ].map((stat) => (
            <Grid item xs={12} md={4} key={stat.label}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>{stat.label}</Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, color: 'text.primary', wordBreak: 'break-word' }}>{stat.value}</Typography>
                  <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13 }}>{stat.helper}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#0f172a', color: '#fff', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 13 }}>Signed in as</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 900 }}>{user?.full_name}</Typography>
                <Typography sx={{ color: '#cbd5e1', mt: 0.75 }}>{user?.email}</Typography>
                <Chip label={user?.role || 'Employee'} sx={{ mt: 2, bgcolor: '#6d28d9', color: '#fff', fontWeight: 700 }} />

                <Stack spacing={1.25} sx={{ mt: 3 }}>
                  <Button component={Link} href="/profile" variant="contained" sx={{ bgcolor: '#6d28d9', textTransform: 'none', fontWeight: 700 }}>
                    View profile
                  </Button>
                  <Button component={Link} href="/settings" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', textTransform: 'none', fontWeight: 700 }}>
                    Account settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>Quick actions</Typography>
                <Typography sx={{ color: 'text.secondary', mb: 2 }}>Shortcuts to the HRMS areas employees visit most.</Typography>
                <Grid container spacing={2}>
                  {quickLinks.map((item) => (
                    <Grid item xs={12} sm={6} key={item.href}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                        <CardContent>
                          <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{item.label}</Typography>
                          <Typography sx={{ mt: 0.75, color: 'text.secondary', lineHeight: 1.6, fontSize: 14 }}>{item.description}</Typography>
                          <Button component={Link} href={item.href} size="small" sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}>
                            Open
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>What this page is for</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.8 }}>
              My Worklife is the employee home base. It gathers the route shortcuts, reminders, and the most common self-service actions without forcing users to search through the full navigation every time.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
