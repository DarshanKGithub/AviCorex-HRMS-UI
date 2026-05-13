'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Tooltip from '@mui/material/Tooltip';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { SIDEBAR_ITEMS } from '@/components/shell/sidebarConfig';
import { iconMap } from '@/components/shell/iconMapping';

const expandedWidth = 300;
const collapsedWidth = 120;

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

// Helper to check if user has permission for an item
function canAccessItem(item: any, hasPermission: (perm: string) => boolean, role?: string): boolean {
  const normalizedRole = (role || '').toLowerCase();

  if (item.adminOnly) {
    return normalizedRole.includes('admin') || hasPermission('manage_services');
  }

  // If no permissions required, allow access
  if (!item.requiredAnyPermissions || item.requiredAnyPermissions.length === 0) {
    return true;
  }
  // Check if user has ANY of the required permissions
  return item.requiredAnyPermissions.some((perm: string) => hasPermission(perm));
}

// Helper to get icon component
function getIconComponent(iconName: string) {
  return iconMap[iconName] || BusinessCenterRoundedIcon;
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, user, logout } = useAuth();
  const { permissions, hasPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(true);
  const currentDrawerWidth = isDesktop ? (collapsed ? collapsedWidth : expandedWidth) : expandedWidth;

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, status]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Filter sidebar items based on permissions
  const visibleItems = useMemo(() => {
    const filterItems = (items: any[]): any[] => {
      return items
        .filter((item) => canAccessItem(item, hasPermission, user?.role))
        .map((item) => ({
          ...item,
          children: item.children ? filterItems(item.children) : undefined
        }))
        .filter((item) => !item.children || item.children.length > 0);
    };
    return filterItems(SIDEBAR_ITEMS);
  }, [hasPermission, user?.role]);

  const activeNav = useMemo(() => {
    const findActive = (items: any[]): any => {
      for (const item of items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          return item;
        }
        if (item.children) {
          const found = findActive(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findActive(visibleItems);
  }, [pathname, visibleItems]);

  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (status === 'loading' || !isAuthenticated || !user) {
    return (
      <Box className="flex min-h-screen items-center justify-center px-6" sx={{ bgcolor: 'background.default' }}>
        <Stack spacing={2} alignItems="center">
          <Box className="h-14 w-14 animate-pulse rounded-2xl bg-[rgba(124,58,237,0.15)]" />
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>Loading secure workspace...</Typography>
        </Stack>
      </Box>
    );
  }

  const renderNavItem = (item: any, depth = 0): React.ReactNode => {
    const Icon = getIconComponent(item.icon);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const isExpanded = expandedItems[item.href] ?? active;

    if (!hasChildren) {
      return (
        <ListItemButton
          key={item.href}
          selected={active}
          onClick={() => void router.push(item.href as never)}
          sx={{
            mb: 0.8,
            borderRadius: 3,
            color: active ? 'text.primary' : 'text.secondary',
            flexDirection: collapsed ? 'column' : 'row',
            minHeight: collapsed ? 56 : 44,
            py: collapsed ? 0.6 : 0.8,
            '&.Mui-selected': {
              bgcolor: isDark ? 'rgba(124, 58, 237, 0.25)' : 'rgba(124, 58, 237, 0.12)',
              color: 'text.primary'
            },
            '&.Mui-selected:hover': {
              bgcolor: 'rgba(124, 58, 237, 0.16)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 24 : 40, color: active ? '#7c3aed' : 'text.secondary', justifyContent: 'center', mb: collapsed ? 0.3 : 0 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          {!collapsed ? (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: active ? 800 : 600 }}
            />
          ) : (
            <Typography sx={{ fontSize: 10, color: active ? 'text.primary' : 'text.secondary', textAlign: 'center', lineHeight: 1.1 }}>
              {item.label}
            </Typography>
          )}
        </ListItemButton>
      );
    }

    // Render parent with collapse for children
    return (
      <Box key={item.href}>
        <ListItemButton
          onClick={() => setExpandedItems((prev) => ({ ...prev, [item.href]: !isExpanded }))}
          sx={{
            mb: 0.8,
            borderRadius: 3,
            color: active ? '#1f2340' : '#5b5f7a',
            flexDirection: collapsed ? 'column' : 'row',
            minHeight: collapsed ? 56 : 44,
            py: collapsed ? 0.6 : 0.8,
            '&.Mui-selected': {
              bgcolor: 'rgba(124, 58, 237, 0.12)',
              color: 'text.primary'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 24 : 40, color: active ? '#7c3aed' : 'text.secondary', justifyContent: 'center', mb: collapsed ? 0.3 : 0 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 800 : 600 }} />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItemButton>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child: any) => {
              const ChildIcon = getIconComponent(child.icon);
              const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

              return (
                <ListItemButton
                  key={child.href}
                  sx={{ pl: 6, mb: 0.6, borderRadius: 2 }}
                  selected={childActive}
                  onClick={() => void router.push(child.href as never)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: childActive ? '#7c3aed' : 'text.secondary', justifyContent: 'center' }}>
                    <ChildIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText primary={child.label} primaryTypographyProps={{ fontWeight: childActive ? 800 : 600 }} />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ px: 2.25, py: 2, position: 'relative', flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1.4}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: isDark ? '#1e293b' : '#fff',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 12px 24px rgba(146, 141, 221, 0.18)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(231, 233, 239, 0.9)'
            }}
          >
            <Image src="/logo.png" alt="HRMS logo" width={44} height={44} style={{ objectFit: 'cover' }} priority />
          </Box>
          <Box sx={{ display: collapsed ? 'none' : 'block', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'text.primary' }}>HRMS</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{user.role} workspace</Typography>
          </Box>

          <Box sx={{ ml: 'auto', display: { xs: 'none', lg: 'block' } }}>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <IconButton size="small" onClick={() => setCollapsed((v) => !v)} sx={{ color: 'text.primary' }}>
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'divider', flexShrink: 0 }} />

      <List
        sx={{
          px: collapsed ? 1 : 1.75,
          py: 1.25,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          scrollbarColor: 'transparent transparent',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          }
        }}
      >
        {visibleItems.map((item) => renderNavItem(item))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ml: { lg: `${currentDrawerWidth}px` },
          width: { lg: `calc(100% - ${currentDrawerWidth}px)` },
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shorter,
          })
        }}
      >
        <Toolbar sx={{ minHeight: 84, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
            {!isDesktop ? (
              <IconButton edge="start" onClick={() => setMobileOpen((value) => !value)} sx={{ color: 'text.primary' }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Box>
              <Typography sx={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: '#7c3aed', fontWeight: 800 }}>
                Secure HRMS Platform
              </Typography>
              <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {activeNav ? activeNav.label : 'Dashboard'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <ThemeToggle />
            <Chip label={user.role} sx={{ bgcolor: 'rgba(124, 58, 237, 0.18)', color: '#6d28d9', fontWeight: 800 }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 0.5 }}>
              <Avatar
                sx={{ bgcolor: '#7c3aed', width: 42, height: 42 }}
                src={resolveAvatarUrl(user.avatar_url)}
              >
                {getInitials(user.full_name)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>{user.full_name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              startIcon={<LogoutRoundedIcon />}
              sx={{ borderColor: 'divider', color: 'text.primary' }}
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
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'transparent',
            overflowX: 'hidden',
            overflowY: 'hidden',
            ...(isDesktop
              ? {
                  top: '0px',
                  height: '100vh',
                }
              : {})
          }
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: { lg: `${currentDrawerWidth}px` },
          pt: '84px',
          px: isDashboardRoute ? { xs: 1, sm: 1.5, lg: 2 } : { xs: 2, sm: 3, lg: 4 },
          pb: 4,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shorter,
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
