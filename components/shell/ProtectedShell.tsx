'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
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
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { generateSidebarItems, type SidebarItem } from '@/components/shell/sidebarConfig';
import { API_BASE_URL } from '@/lib/apiBase';

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
  performance: TrendingUpRoundedIcon,
  notifications: NotificationsRoundedIcon
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

  return `${API_BASE_URL.replace(/\/$/, '')}/${avatarUrl.replace(/^\//, '')}`;
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { status, token, isAuthenticated, user, logout } = useAuth();
  const { status: permissionStatus, permissionSet } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    { role: 'assistant', content: 'I can help summarize leaves, tickets, documents, and org data from this workspace.' }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedHref, setExpandedHref] = useState<string | null>(pathname?.startsWith('/leaves') ? '/leaves' : null);

  const navItems = useMemo(() => generateSidebarItems(permissionSet), [permissionSet]);

  useEffect(() => {
    if (status !== 'ready' || !isAuthenticated || !user?.id || !token) {
      setUnreadCount(0);
      return;
    }

    const abortController = new AbortController();

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/me/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json().catch(() => null);
        setUnreadCount(typeof payload?.unread_count === 'number' ? payload.unread_count : 0);
      } catch {
        if (!abortController.signal.aborted) {
          setUnreadCount(0);
        }
      }
    };

    void fetchUnreadCount();
    const intervalId = window.setInterval(fetchUnreadCount, 30000);

    return () => {
      abortController.abort();
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, pathname, status, token, user?.id]);

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

  const assistantSuggestions = [
    'Summarize my leave balances',
    'Show pending support tickets',
    'Open document center',
    'Show organization hierarchy'
  ];

  function buildAssistantReply(message: string) {
    const text = message.toLowerCase();
    if (text.includes('leave')) {
      return 'Open Leaves to review balances, pending requests, and holiday calendar data.';
    }
    if (text.includes('ticket') || text.includes('request')) {
      return 'Request Hub is available from the sidebar and shows tickets, gate passes, and grievances.';
    }
    if (text.includes('document')) {
      return 'Document Center is wired to the shared API base and should load the team archive.';
    }
    if (text.includes('org') || text.includes('hierarchy')) {
      return 'Organization Hierarchy is protected and now shares the same production-safe API base.';
    }
    return 'I can help navigate the HRMS workspace, surface key screens, or summarize the active admin flows.';
  }

  function sendAssistantMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = assistantDraft.trim();
    if (!message) {
      return;
    }

    setAssistantMessages((current) => [
      ...current,
      { role: 'user', content: message },
      { role: 'assistant', content: buildAssistantReply(message) }
    ]);
    setAssistantDraft('');
  }

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
                  {(item.children ?? []).map((child: SidebarItem, index: number) => {
                    const ChildIcon = iconMap[child.icon];
                    const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                    return (
                      <ListItemButton
                        key={`${child.href}-${index}`}
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
            <Button
              onClick={() => setAssistantOpen(true)}
              variant="outlined"
              startIcon={<SmartToyRoundedIcon />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderColor: '#c7d2fe',
                color: '#4338ca',
                bgcolor: '#eef2ff',
                fontWeight: 800,
                borderRadius: 999,
                px: 2,
                py: 1,
                '&:hover': { bgcolor: '#e0e7ff', borderColor: '#a5b4fc' }
              }}
            >
              AI Chat
            </Button>
            <IconButton
              onClick={() => setAssistantOpen(true)}
              aria-label="Open AI chat"
              sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: '#4338ca' }}
            >
              <SmartToyRoundedIcon />
            </IconButton>
            <IconButton
              onClick={() => void router.push('/notifications' as never)}
              aria-label="Open notifications"
              data-testid="notification-bell"
              sx={{ color: '#0f172a' }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                overlap="circular"
                max={99}
                invisible={unreadCount <= 0}
                data-testid="notification-badge"
              >
                <NotificationsRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
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

      <Drawer
        anchor="right"
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 400, md: 440 },
            boxSizing: 'border-box',
            bgcolor: '#0f172a',
            color: '#e2e8f0',
            borderLeft: '1px solid rgba(148, 163, 184, 0.18)'
          }
        }}
      >
        <Box sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(99, 102, 241, 0.18)', color: '#c7d2fe' }}>
                <SmartToyRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#f8fafc' }}>AI Assistant</Typography>
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Workspace side panel</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setAssistantOpen(false)} sx={{ color: '#cbd5e1' }} aria-label="Close AI chat">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.16)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>Quick prompts</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {assistantSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="small"
                    onClick={() => setAssistantDraft(suggestion)}
                    sx={{
                      textTransform: 'none',
                      bgcolor: 'rgba(99, 102, 241, 0.16)',
                      color: '#c7d2fe',
                      borderRadius: 999,
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.28)' }
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
              {assistantMessages.map((message, index) => (
                <Box
                  key={`${message.role}-${index}`}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    bgcolor: message.role === 'user' ? '#4f46e5' : 'rgba(30, 41, 59, 0.92)',
                    color: '#f8fafc',
                    boxShadow: message.role === 'user' ? '0 12px 24px -12px rgba(79, 70, 229, 0.45)' : 'none'
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>{message.content}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box component="form" onSubmit={sendAssistantMessage} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="stretch">
              <Box sx={{ flex: 1 }}>
                <textarea
                  value={assistantDraft}
                  onChange={(event) => setAssistantDraft(event.target.value)}
                  placeholder="Ask about leaves, documents, org data, or tickets..."
                  rows={3}
                  style={{
                    width: '100%',
                    resize: 'none',
                    borderRadius: 16,
                    border: '1px solid rgba(148, 163, 184, 0.24)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#f8fafc',
                    padding: '14px 16px',
                    outline: 'none',
                    font: 'inherit'
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 56,
                  borderRadius: 3,
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ ml: { lg: `${drawerWidth}px` }, pt: '96px', px: { xs: 2, sm: 3, lg: 4 }, pb: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
