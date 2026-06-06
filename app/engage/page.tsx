'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { API_BASE_URL, apiFetch } from '@/lib/apiBase';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
};

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
};

export default function EngagePage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [announcementsRes, ticketsRes] = await Promise.allSettled([
          apiFetch(`${API_BASE_URL}/engagement/announcements?page=1&size=5`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          apiFetch(`${API_BASE_URL}/engagement/tickets?page=1&size=5`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        let nextError: string | null = null;

        if (announcementsRes.status === 'fulfilled') {
          const announcementsData = announcementsRes.value.ok ? await announcementsRes.value.json() : { items: [] };
          setAnnouncements(announcementsData.items || []);
        } else {
          setAnnouncements([]);
          nextError = announcementsRes.reason instanceof Error ? announcementsRes.reason.message : 'Unable to load announcements.';
        }

        if (ticketsRes.status === 'fulfilled') {
          const ticketsData = ticketsRes.value.ok ? await ticketsRes.value.json() : { items: [] };
          setTickets(ticketsData.items || []);
        } else {
          setTickets([]);
          nextError = nextError || (ticketsRes.reason instanceof Error ? ticketsRes.reason.message : 'Unable to load tickets.') ;
        }

        setError(nextError);
      } catch {
        setError('Unable to load engagement data right now.');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [token]);

  const stats = useMemo(
    () => [
      { label: 'Announcements', value: announcements.length, icon: <CampaignOutlinedIcon />, color: '#6366f1', bg: '#e0e7ff' },
      { label: 'Tickets', value: tickets.length, icon: <ConfirmationNumberOutlinedIcon />, color: '#10b981', bg: '#dcfce7' },
      { label: 'Open focus', value: tickets.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status)).length, icon: <TrackChangesOutlinedIcon />, color: '#f59e0b', bg: '#fef3c7' },
    ],
    [announcements, tickets]
  );

  return (
    <Box sx={{ bgcolor: '#f4f6fc', minHeight: '100vh', px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumbs />

      <Stack spacing={4} sx={{ mt: 2 }}>
        <Box>
          <Chip label="Engage" sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 800, mb: 1.5, borderRadius: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#1e293b' }}>
            Engagement hub
          </Typography>
          <Typography sx={{ color: '#64748b', maxWidth: 820, mt: 0.5 }}>
            Keep up with announcements, support tickets, and the latest workplace updates from a single place.
          </Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ borderRadius: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {stats.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, mb: 2 }}>
                  {item.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, letterSpacing: '-0.02em' }}>{item.value}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ ...commonCardStyles, p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Announcements</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Latest messages from leadership and HR.</Typography>
                </Box>
                <Button component={Link} href="/announcements" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', color: '#6366f1', borderColor: '#e0e7ff', fontWeight: 700 }}>
                  Open full feed
                </Button>
              </Stack>

              {loading ? (
                <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 220 }}><CircularProgress /></Box>
              ) : announcements.length === 0 ? (
                <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>No announcements available yet.</Typography>
              ) : (
                <Stack spacing={2}>
                  {announcements.map((announcement) => {
                    const priorityColor = announcement.priority.toLowerCase() === 'high' ? '#ef4444' : announcement.priority.toLowerCase() === 'low' ? '#10b981' : '#f59e0b';
                    const priorityBg = announcement.priority.toLowerCase() === 'high' ? '#fee2e2' : announcement.priority.toLowerCase() === 'low' ? '#dcfce7' : '#fef3c7';

                    return (
                      <Box key={announcement.id} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', transition: 'all 0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#e2e8f0', color: '#475569', fontSize: '0.9rem', fontWeight: 800 }}>A</Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>{announcement.title}</Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                {new Date(announcement.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip label={announcement.priority} size="small" sx={{ bgcolor: priorityBg, color: priorityColor, fontWeight: 800, borderRadius: 1.5, fontSize: '0.7rem' }} />
                        </Stack>
                        <Typography sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, pl: 6 }}>{announcement.content}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              <Card sx={{ ...commonCardStyles, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>My tickets</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 3 }}>Track support requests and work items.</Typography>
                {loading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 180 }}><CircularProgress size={24} /></Box>
                ) : tickets.length === 0 ? (
                  <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>No tickets submitted yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {tickets.map((ticket) => {
                       const statusColor = ticket.status === 'Resolved' ? '#10b981' : ticket.status === 'Open' ? '#3b82f6' : '#64748b';
                       const statusBg = ticket.status === 'Resolved' ? '#dcfce7' : ticket.status === 'Open' ? '#dbeafe' : '#f1f5f9';
                       return (
                        <Box key={ticket.id} sx={{ pb: 2, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', mb: 0.5 }}>{ticket.subject}</Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>{ticket.category} • {new Date(ticket.created_at).toLocaleDateString()}</Typography>
                            </Box>
                            <Chip label={ticket.status} size="small" sx={{ bgcolor: statusBg, color: statusColor, fontWeight: 700, borderRadius: 1.5, fontSize: '0.7rem' }} />
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Card>

              <Card sx={{ ...commonCardStyles, p: 3, background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, position: 'relative', zIndex: 1 }}>Quick actions</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', mb: 3, position: 'relative', zIndex: 1 }}>Jump into the spaces employees use most.</Typography>
                <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <Button component={Link} href="/announcements" endIcon={<ChevronRightIcon />} sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', textTransform: 'none', fontWeight: 700, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                    Read announcements
                  </Button>
                  <Button component={Link} href="/helpdesk" endIcon={<ChevronRightIcon />} sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', textTransform: 'none', fontWeight: 700, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                    Open helpdesk
                  </Button>
                  <Button component={Link} href="/todo" endIcon={<ChevronRightIcon />} sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', textTransform: 'none', fontWeight: 700, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                    Manage my tasks
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
