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

import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Avatar from '@mui/material/Avatar';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
};


export default function MyWorklifePage() {
  const { user } = useAuth();

  const quickLinks = [
    { label: 'My profile', href: '/profile', description: 'Update personal and job details.', icon: <PersonOutlineIcon />, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Attendance', href: '/attendance', description: 'Clock in, clock out, and review time.', icon: <AccessTimeIcon />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Leaves', href: '/leaves', description: 'Apply for leave and track balances.', icon: <FlightTakeoffIcon />, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Engage', href: '/engage', description: 'Catch up on announcements and tickets.', icon: <CampaignOutlinedIcon />, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'To Do', href: '/todo', description: 'Track personal priorities.', icon: <AssignmentOutlinedIcon />, color: '#ef4444', bg: '#fee2e2' },
    { label: 'Helpdesk', href: '/helpdesk', description: 'Open support requests when needed.', icon: <SupportAgentIcon />, color: '#06b6d4', bg: '#cffafe' },
  ];

  return (
    <Box sx={{ bgcolor: '#f4f6fc', minHeight: '100vh', px: { xs: 2, md: 4 }, py: 3, overflowX: 'hidden' }}>
      <Breadcrumbs />

      <Stack spacing={4} sx={{ mt: 2 }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Chip label="My Worklife" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, mb: 1.5, borderRadius: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#1e293b' }}>
            Personal workspace
          </Typography>
          <Typography sx={{ color: '#64748b', maxWidth: 760, mt: 0.5, mx: { xs: 'auto', md: 0 } }}>
            One place for the things you use every day: personal details, attendance, leave, tasks, and support.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            { label: 'Focus areas', value: quickLinks.length.toString(), helper: 'Shortcuts and essentials', icon: <TrackChangesOutlinedIcon />, color: '#6366f1', bg: '#e0e7ff' },
            { label: 'Today', value: new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), helper: 'Daily view', icon: <TodayOutlinedIcon />, color: '#10b981', bg: '#dcfce7' },
            { label: 'Status', value: user?.role || 'Employee', helper: 'Current workspace role', icon: <PersonOutlineIcon />, color: '#f59e0b', bg: '#fef3c7' },
          ].map((stat) => (
            <Grid item xs={12} md={4} key={stat.label}>
              <Card sx={{ ...commonCardStyles, width:'90%', p: 2, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 2.5, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" sx={{fontWeight: 900, color: '#1e293b', mb: 1, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{stat.value}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</Typography>
                <Typography sx={{ mt: 0.2, color: '#94a3b8', fontSize: '0.75rem' }}>{stat.helper}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={5}>
            <Card sx={{ ...commonCardStyles, p: 4, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: '#fff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.85rem', mb: 2, position: 'relative', zIndex: 1 }}>Signed in as</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 1, position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.25rem', fontWeight: 800, mb: { xs: 1, md: 0 } }}>
                  {user?.full_name ? user.full_name[0] : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>{user?.full_name}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</Typography>
                </Box>
              </Stack>
              
              <Chip label={user?.role || 'Employee'} sx={{ mt: { xs: 2, md: 1 }, mb: 4, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, position: 'relative', zIndex: 1 }} />

              <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Button component={Link} href="/profile" endIcon={<ChevronRightIcon />} sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', textTransform: 'none', fontWeight: 700, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                  View profile
                </Button>
                <Button component={Link} href="/settings" endIcon={<ChevronRightIcon />} sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', textTransform: 'none', fontWeight: 700, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                  Account settings
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ ...commonCardStyles, p: 4 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3 }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Quick actions</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Shortcuts to the areas employees visit most.</Typography>
                </Box>
              </Stack>
              <Grid container spacing={2}>
                {quickLinks.map((item) => (
                  <Grid item xs={12} sm={6} key={item.href}>
                    <Link href={item.href as any} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #f1f5f9', height: '100%', transition: 'all 0.2s', '&:hover': { bgcolor: '#f8fafc', borderColor: '#e2e8f0', transform: 'translateY(-2px)' }, boxShadow: 'none' }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, mb: { xs: 1, md: 0 } }}>
                              {item.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>{item.label}</Typography>
                          </Stack>
                          <Typography sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.8rem' }}>{item.description}</Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>

      </Stack>
    </Box>
  );
}
