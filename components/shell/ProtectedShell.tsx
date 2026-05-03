'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { useAuth } from '@/components/auth/AuthContext';

const drawerWidth = 288;

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardRoundedIcon },
  { label: 'Employees', href: '/employees', icon: GroupsRoundedIcon },
  { label: 'Attendance', href: '/attendance', icon: TodayRoundedIcon },
  { label: 'Payroll', href: '/payroll', icon: PaymentsRoundedIcon },
  { label: 'Leaves', href: '/leaves', icon: DirectionsRunRoundedIcon },
  { label: 'My Profile', href: '/profile', icon: PersonRoundedIcon },
  { label: 'Settings', href: '/settings', icon: SettingsRoundedIcon }
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, status]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeNav = useMemo(
    () => navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [pathname]
  );

  if (status === 'loading' || !isAuthenticated || !user) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f7ff_100%)] px-6">
        <Stack spacing={2} alignItems="center">
          <Box className="h-14 w-14 animate-pulse rounded-2xl bg-[rgba(146,141,221,0.15)]" />
          <Typography sx={{ color: '#5b5f7a', fontWeight: 700 }}>Loading secure workspace...</Typography>
        </Stack>
      </Box>
    );
  }

  const sidebarContent = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, rgba(252,252,254,0.98), rgba(243,244,255,0.92))' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.4}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#928ddd',
              color: '#fff',
              boxShadow: '0 12px 24px rgba(146, 141, 221, 0.3)'
            }}
          >
            <BusinessCenterRoundedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>HRMS</Typography>
            <Typography sx={{ color: '#5b5f7a', fontSize: 13 }}>{user.role} workspace</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <ListItemButton
              key={item.href}
              selected={active}
              onClick={() => void router.push(item.href as never)}
              sx={{
                mb: 0.8,
                borderRadius: 3,
                color: active ? '#1f2340' : '#5b5f7a',
                '&.Mui-selected': {
                  bgcolor: 'rgba(178, 174, 242, 0.2)',
                  color: '#15162c'
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'rgba(178, 174, 242, 0.24)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? '#928ddd' : '#8d90a8' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 800 : 600 }}
              />
            </ListItemButton>
          );
        })}
      </List>

     
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfe' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(252, 252, 254, 0.82)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid #e7e9ef',
          color: '#15162c'
        }}
      >
        <Toolbar sx={{ minHeight: 84, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
            {!isDesktop ? (
              <IconButton edge="start" onClick={() => setMobileOpen((value) => !value)} sx={{ color: '#15162c' }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Box>
              <Typography sx={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: '#928ddd', fontWeight: 800 }}>
                Secure HRMS Platform
              </Typography>
              <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {activeNav ? activeNav.label : 'Dashboard'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label={user.role} sx={{ bgcolor: 'rgba(178, 174, 242, 0.18)', color: '#4f4b9c', fontWeight: 800 }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 0.5 }}>
              <Avatar sx={{ bgcolor: '#928ddd', width: 42, height: 42 }}>{getInitials(user.full_name)}</Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 800, color: '#15162c', lineHeight: 1.1 }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#5b5f7a', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              startIcon={<LogoutRoundedIcon />}
              sx={{ borderColor: '#e7e9ef', color: '#1f2340' }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e7e9ef',
            bgcolor: 'transparent'
          }
        }}
      >
        <Toolbar sx={{ minHeight: 84 }} />
        {sidebarContent}
      </Drawer>

      <Box component="main" sx={{ ml: { lg: `${drawerWidth}px` }, pt: '96px', px: { xs: 2, sm: 3, lg: 4 }, pb: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
