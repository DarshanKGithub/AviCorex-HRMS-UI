'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { API_BASE_URL } from '@/lib/apiBase';

type NotificationItem = {
  id: string;
  subject?: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(() => items.filter((item) => item.status !== 'Read').length, [items]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/me/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Unable to load notifications.');
        }
        const payload = await response.json().catch(() => []);
        setItems(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  async function markAsRead(id: string) {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Read' }),
      });
      if (!response.ok) {
        throw new Error('Unable to mark notification as read.');
      }
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status: 'Read' } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark notification as read.');
    }
  }

  async function removeNotification(id: string) {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Unable to delete notification.');
      }
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete notification.');
    }
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsRoundedIcon color="primary" />
          Notifications
        </Typography>
        <Chip label={`${unreadCount} unread`} sx={{ bgcolor: '#eef2ff', color: '#3730a3', fontWeight: 700 }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <NotificationsRoundedIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: '#15162c' }}>No notifications yet</Typography>
            <Typography sx={{ color: '#64748b' }}>You will see alerts here when new activity happens.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {items.map((item) => (
            <Card key={item.id} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#15162c' }}>{item.subject || 'Notification'}</Typography>
                    <Typography sx={{ color: '#64748b', mt: 0.5 }}>{item.message}</Typography>
                    <Typography sx={{ color: '#94a3b8', mt: 1, fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: item.status === 'Read' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: item.status === 'Read' ? '#059669' : '#d97706',
                        fontWeight: 700,
                      }}
                    />
                    {item.status !== 'Read' && (
                      <Button size="small" onClick={() => void markAsRead(item.id)} startIcon={<DoneAllRoundedIcon />}>
                        Mark Read
                      </Button>
                    )}
                    <Button size="small" color="error" onClick={() => void removeNotification(item.id)} startIcon={<DeleteOutlineRoundedIcon />}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
