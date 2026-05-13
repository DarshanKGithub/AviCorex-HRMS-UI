'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  author_id: string;
  created_at: string;
}

interface PaginatedResponse {
  items: Announcement[];
  total: number;
  page: number;
  size: number;
}

export default function AnnouncementsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Normal',
  });

  useEffect(() => {
    if (token) {
      setIsAdmin(['Admin', 'HR'].includes(user?.role || ''));
      fetchAnnouncements();
    }
  }, [token, user?.role]);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/engagement/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setAnnouncements(data.items);
      }
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/engagement/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          author_id: user?.id,
        }),
      });

      if (res.ok) {
        setSuccess('Announcement created successfully');
        setOpenModal(false);
        setFormData({ title: '', content: '', priority: 'Normal' });
        await fetchAnnouncements();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to create announcement');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#991b1b', dark: '#7f1d1d' };
      case 'Normal':
        return { bg: '#dbeafe', text: '#1e40af', dark: '#1e3a8a' };
      case 'Low':
        return { bg: '#dcfce7', text: '#166534', dark: '#15803d' };
      default:
        return { bg: '#f3f4f6', text: '#4b5563', dark: '#1f2937' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CampaignIcon color="primary" />
          Announcements & Updates
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 600 }}
          >
            Post Announcement
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {announcements.length === 0 ? (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CampaignIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
            <Typography sx={{ color: 'text.secondary' }}>
              No announcements at the moment. Check back later!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {announcements
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((announcement) => {
              const colors = getPriorityColor(announcement.priority);
              return (
                <Card
                  key={announcement.id}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${colors.bg}`,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: colors.dark,
                          flex: 1,
                        }}
                      >
                        {announcement.title}
                      </Typography>
                      <Chip
                        label={announcement.priority}
                        size="small"
                        sx={{
                          bgcolor: colors.bg,
                          color: colors.text,
                          fontWeight: 600,
                          ml: 1,
                        }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                        mb: 1.5,
                        lineHeight: 1.6,
                      }}
                    >
                      {announcement.content}
                    </Typography>

                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                      Posted on {new Date(announcement.created_at).toLocaleDateString()} at{' '}
                      {new Date(announcement.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
        </Stack>
      )}

      {/* Create Announcement Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Post New Announcement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., System Maintenance Notice"
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your announcement here..."
            />
            <TextField
              select
              label="Priority"
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#7c3aed', textTransform: 'none' }}
          >
            Post Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
