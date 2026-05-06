'use client';

import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack,
  Button, Avatar, Divider, Chip, AvatarGroup,
  List, ListItem, ListItemAvatar, ListItemText,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  InfoOutlined,
  Circle,
  TrendingUp,
  Bolt
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// --- STYLING CONSTANTS ---
const DESIGN = {
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(231, 235, 241, 1)',
    borderRadius: 5
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    blue: '#2563eb'
  }
};

// --- MOCK DATA ---
const activityData = [
  { id: 1, type: 'checkin', user: 'Sarah Connor', time: '09:00 AM', text: 'Clocked in from London office' },
  { id: 2, type: 'approval', user: 'System', time: '11:30 AM', text: 'Leave request for Bakrid approved' },
  { id: 3, type: 'update', user: 'HR Team', time: '02:15 PM', text: 'Updated Employee Handbook 2026' },
];

const teamStatus = [
  { name: 'Sarah C.', status: 'online', role: 'Dev', avatar: 'S' },
  { name: 'Mike R.', status: 'away', role: 'Design', avatar: 'M' },
  { name: 'Jordan P.', status: 'offline', role: 'Product', avatar: 'J' },
  { name: 'Elena W.', status: 'online', role: 'HR', avatar: 'E' },
];

export default function UltimateDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: '#fbfcfd', minHeight: '100vh' }}>

      {/* 1. TOP TEAM PRESENCE STRIP */}
      <Card sx={{ ...DESIGN.glass, mb: 4, p: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ overflowX: 'auto', pb: 1 }}>
          <Box sx={{ minWidth: 140, borderRight: '2px solid #f1f5f9', pr: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: DESIGN.text.secondary }}>TEAM STATUS</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUp sx={{ color: '#10b981', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>85% Active</Typography>
            </Stack>
          </Box>
          {teamStatus.map((member, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 130 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: i % 2 === 0 ? '#eff6ff' : '#f5f3ff', color: DESIGN.text.blue, fontSize: '0.9rem', fontWeight: 700 }}>
                  {member.avatar}
                </Avatar>
                <Circle sx={{
                  position: 'absolute', bottom: 0, right: 0, fontSize: 12,
                  color: member.status === 'online' ? '#10b981' : member.status === 'away' ? '#f59e0b' : '#94a3b8',
                  border: '2px solid #fff', borderRadius: '50%', bgcolor: 'currentColor'
                }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{member.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: DESIGN.text.secondary }}>{member.role}</Typography>
              </Box>
            </Stack>
          ))}
          <Button variant="text" sx={{ color: DESIGN.text.blue, fontWeight: 700, fontSize: '0.8rem' }}>+ 12 More</Button>
        </Stack>
      </Card>

      <Grid container spacing={4}>
        {/* Left Column: Analytics & Activity */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>

            {/* HERO BANNER (Modernized) */}
            <Card sx={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: 6, p: 1, position: 'relative', overflow: 'hidden'
            }}>
              <CardContent sx={{ color: '#fff', p: 4 }}>
                <Grid container alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Chip label="2026 Q2 Performance" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Welcome back, Alex!</Typography>
                    <Typography sx={{ opacity: 0.8, mb: 3 }}>You have completed 92% of your monthly goals. Keep the momentum going!</Typography>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" sx={{ bgcolor: '#fff', color: '#1e3a8a', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}>Download Report</Button>
                      <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 2, textTransform: 'none' }}>View Goals</Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
              <Bolt sx={{ position: 'absolute', right: -20, top: -20, fontSize: 200, opacity: 0.1, color: '#fff' }} />
            </Card>

            {/* ACTIVITY FEED */}
            <Card sx={{ ...DESIGN.glass, p: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Activity</Typography>
                  <Button size="small" sx={{ textTransform: 'none' }}>View Audit Log</Button>
                </Stack>
                <List disablePadding>
                  {activityData.map((item, idx) => (
                    <ListItem key={item.id} sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: item.type === 'checkin' ? '#ecfdf5' : '#eff6ff' }}>
                          {item.type === 'checkin' ? <CheckCircle sx={{ color: '#10b981' }} /> : <InfoOutlined sx={{ color: '#3b82f6' }} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.user}</Typography>}
                        secondary={item.text}
                      />
                      <Typography variant="caption" sx={{ color: DESIGN.text.secondary, fontWeight: 600 }}>{item.time}</Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Attendance & Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* COMPACT CLOCK-IN */}
            <Card sx={{ borderRadius: 6, bgcolor: '#111827', color: '#fff', p: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography sx={{ opacity: 0.6, fontSize: '0.8rem', letterSpacing: 2, fontWeight: 700, mb: 1 }}>CURRENT TIME</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>23:03:55</Typography>
                <Typography sx={{ opacity: 0.8, fontSize: '0.9rem', mb: 3 }}>Sunday, May 3rd</Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: '#3b82f6', py: 2, borderRadius: 4, fontWeight: 800, fontSize: '1rem',
                    '&:hover': { bgcolor: '#2563eb' }
                  }}
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>

            {/* QUICK ACTIONS GRID */}
            <Typography variant="h6" sx={{ fontWeight: 800, px: 1 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {['Apply Leave', 'Expense', 'Payslip', 'Help Desk'].map((action) => (
                <Grid item xs={6} key={action}>
                  <Card sx={{
                    ...DESIGN.glass, textAlign: 'center', cursor: 'pointer',
                    '&:hover': { borderColor: '#3b82f6', bgcolor: '#f0f7ff' },
                    transition: '0.2s'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: '#eff6ff', borderRadius: 2, mx: 'auto', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bolt sx={{ color: '#3b82f6', fontSize: 20 }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{action}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}