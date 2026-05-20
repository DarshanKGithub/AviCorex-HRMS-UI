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
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { API_BASE_URL, apiFetch } from '@/lib/apiBase';

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
      { label: 'Announcements', value: announcements.length },
      { label: 'Tickets', value: tickets.length },
      { label: 'Open focus', value: tickets.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status)).length },
    ],
    [announcements, tickets]
  );

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumbs />

      <Stack spacing={3}>
        <Box>
          <Chip label="Engage" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Engagement hub
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 820 }}>
            Keep up with announcements, support tickets, and the latest workplace updates from a single place.
          </Typography>
        </Box>

        {error && <Alert severity="warning">{error}</Alert>}

        <Grid container spacing={2.5}>
          {stats.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.04)' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: 'text.primary' }}>{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>Announcements</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Latest messages from leadership and HR.</Typography>
                  </Box>
                  <Button component={Link} href="/announcements" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Open full feed
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2.5 }} />

                {loading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 220 }}><CircularProgress /></Box>
                ) : announcements.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary' }}>No announcements available yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {announcements.map((announcement) => (
                      <Box key={announcement.id} sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default', border: '1px solid #e2e8f0' }}>
                        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 0.8 }}>
                          <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{announcement.title}</Typography>
                          <Chip label={announcement.priority} size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
                        </Stack>
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{announcement.content}</Typography>
                        <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 12 }}>
                          {new Date(announcement.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>My tickets</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>Track support requests and work items.</Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  {loading ? (
                    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 180 }}><CircularProgress size={24} /></Box>
                  ) : tickets.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>No tickets submitted yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {tickets.map((ticket) => (
                        <Box key={ticket.id} sx={{ p: 1.8, borderRadius: 2.5, bgcolor: 'background.paper', border: '1px solid #e2e8f0' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{ticket.subject}</Typography>
                              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{ticket.category}</Typography>
                            </Box>
                            <Chip label={ticket.status} size="small" sx={{ fontWeight: 700 }} />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#0f172a', color: '#fff' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Quick actions</Typography>
                  <Typography sx={{ mt: 1, color: '#cbd5e1' }}>Jump into the spaces employees use most.</Typography>
                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    <Button component={Link} href="/announcements" variant="contained" sx={{ bgcolor: '#6d28d9', textTransform: 'none', fontWeight: 700 }}>
                      Read announcements
                    </Button>
                    <Button component={Link} href="/helpdesk" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', textTransform: 'none', fontWeight: 700 }}>
                      Open helpdesk
                    </Button>
                    <Button component={Link} href="/todo" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', textTransform: 'none', fontWeight: 700 }}>
                      Manage my tasks
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
