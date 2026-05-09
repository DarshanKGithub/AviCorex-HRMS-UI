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
import Collapse from '@mui/material/Collapse';
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
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import WindowRoundedIcon from '@mui/icons-material/WindowRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { generateSidebarItems, type SidebarItem } from '@/components/shell/sidebarConfig';

const drawerWidth = 288;

const iconMap = {
  home: HomeRoundedIcon,
  engage: SensorsRoundedIcon,
  worklife: WindowRoundedIcon,
  todo: AssignmentRoundedIcon,
  salary: PaymentsRoundedIcon,
  leave: DirectionsRunRoundedIcon,
  attendance: FactCheckRoundedIcon,
  expense: AccountBalanceWalletRoundedIcon,
  docs: FolderRoundedIcon,
  people: GroupsRoundedIcon,
  helpdesk: InfoRoundedIcon,
  requests: AppsRoundedIcon,
  workflow: AccountTreeRoundedIcon,
  dashboard: DashboardRoundedIcon,
  employees: GroupsRoundedIcon,
  payroll: PaymentsRoundedIcon,
  leaves: DirectionsRunRoundedIcon,
  profile: PersonRoundedIcon,
  settings: SettingsRoundedIcon,
  calendar: TodayRoundedIcon,
  performance: TrendingUpRoundedIcon
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
  return `${base.replace(/\/$/, '')}/${avatarUrl.replace(/^\//, '')}`;
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, user, logout } = useAuth();
  const { status: permissionStatus, permissionSet } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedHref, setExpandedHref] = useState<string | null>(pathname?.startsWith('/leaves') ? '/leaves' : null);

  const navItems = useMemo(() => generateSidebarItems(permissionSet), [permissionSet]);

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, status]);

  useEffect(() => {
    if (status !== 'ready' || permissionStatus !== 'ready' || !isAuthenticated) {
      return;
    }

    const allowedPaths = navItems.flatMap((item) => {
      const parent = [item.href];
      const children = (item.children ?? []).map((child) => child.href);
      return [...parent, ...children];
    });
    const isAllowed = allowedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (!isAllowed) {
      const fallback = navItems[0]?.href ?? '/profile';
      router.replace(fallback as never);
    }
  }, [isAuthenticated, navItems, pathname, permissionStatus, router, status]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeNav = useMemo(
    () => navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [pathname]
  );

  if (status === 'loading' || !isAuthenticated || !user) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
        <Stack spacing={2} alignItems="center">
          <Box className="h-14 w-14 animate-pulse rounded-2xl bg-blue-100" />
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading secure workspace...</Typography>
        </Stack>
      </Box>
    );
  }

  const sidebarContent = (
    <Box sx={{ height: '100%', bgcolor: '#ffffff' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.4}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
            }}
          >
            <BusinessCenterRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.2 }}>HRMS</Typography>
            <Typography sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{user.role} workspace</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (!hasChildren) {
            return (
              <ListItemButton
                key={item.href}
                selected={active}
                onClick={() => void router.push(item.href as never)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  color: active ? '#2563eb' : '#64748b',
                  '&.Mui-selected': {
                    bgcolor: '#eff6ff',
                    color: '#2563eb'
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: '#dbeafe'
                  },
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    color: '#0f172a'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? '#3b82f6' : '#94a3b8' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.95rem' }}
                />
              </ListItemButton>
            );
          }

          // render parent with collapse for children
          return (
            <Box key={item.href}>
              <ListItemButton
                onClick={() => setExpandedHref((current) => (current === item.href ? null : item.href))}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  color: active ? '#0f172a' : '#64748b',
                  '&.Mui-selected': {
                    bgcolor: '#eff6ff',
                    color: '#2563eb'
                  },
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    color: '#0f172a'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? '#3b82f6' : '#94a3b8' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.95rem' }} />
                {expandedHref === item.href ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={expandedHref === item.href} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {(item.children ?? []).map((child: SidebarItem) => {
                    const ChildIcon = iconMap[child.icon];
                    const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                    return (
                      <ListItemButton
                        key={child.href}
                        sx={{ pl: 6, mb: 0.5, borderRadius: 2, color: childActive ? '#2563eb' : '#64748b', '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' } }}
                        selected={childActive}
                        onClick={() => void router.push(child.href as never)}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: childActive ? '#3b82f6' : '#cbd5e1' }}>
                          <ChildIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={child.label} primaryTypographyProps={{ fontWeight: childActive ? 600 : 500, fontSize: '0.9rem' }} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

     
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a'
        }}
      >
        <Toolbar sx={{ minHeight: 84, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
            {!isDesktop ? (
              <IconButton edge="start" onClick={() => setMobileOpen((value) => !value)} sx={{ color: '#0f172a' }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Secure HRMS Platform
              </Typography>
              <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
                {activeNav ? activeNav.label : 'Dashboard'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label={user.role} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: 1.5 }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 0.5 }}>
              <Avatar
                sx={{ bgcolor: '#3b82f6', width: 40, height: 40, fontSize: '1rem', fontWeight: 600 }}
                src={resolveAvatarUrl(user.avatar_url)}
              >
                {getInitials(user.full_name)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.1, fontSize: '0.95rem' }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 12 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Button
              variant="text"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              sx={{ color: '#64748b', minWidth: 0, p: 1, '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}
            >
              <LogoutRoundedIcon fontSize="small" />
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
            borderRight: '1px solid #e2e8f0',
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
