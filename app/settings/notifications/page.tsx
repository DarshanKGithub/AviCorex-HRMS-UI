'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { API_BASE_URL } from '@/lib/apiBase';

type PreferenceState = {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

const defaultPreferences: PreferenceState = {
  email_enabled: true,
  sms_enabled: false,
  in_app_enabled: true,
  push_enabled: true,
  quiet_hours_start: '',
  quiet_hours_end: '',
};

export default function NotificationSettingsPage() {
  const { token } = useAuth();
  const [preferences, setPreferences] = useState<PreferenceState>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/preferences/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Unable to load notification settings.');
        }
        const payload = await response.json();
        setPreferences({
          email_enabled: !!payload.email_enabled,
          sms_enabled: !!payload.sms_enabled,
          in_app_enabled: !!payload.in_app_enabled,
          push_enabled: !!payload.push_enabled,
          quiet_hours_start: payload.quiet_hours_start ?? '',
          quiet_hours_end: payload.quiet_hours_end ?? '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load notification settings.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  async function savePreferences() {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Unable to save notification settings.');
      }

      setSuccess('Preferences saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save notification settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 2.5 }}>
        Notification Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
        <CardContent>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <FormControlLabel
                control={<Switch checked={preferences.email_enabled} onChange={(event) => setPreferences((current) => ({ ...current, email_enabled: event.target.checked }))} />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch checked={preferences.sms_enabled} onChange={(event) => setPreferences((current) => ({ ...current, sms_enabled: event.target.checked }))} />}
                label="SMS Notifications"
              />
              <FormControlLabel
                control={<Switch checked={preferences.in_app_enabled} onChange={(event) => setPreferences((current) => ({ ...current, in_app_enabled: event.target.checked }))} />}
                label="In-App Notifications"
              />
              <FormControlLabel
                control={<Switch checked={preferences.push_enabled} onChange={(event) => setPreferences((current) => ({ ...current, push_enabled: event.target.checked }))} />}
                label="Push Notifications"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Quiet Hours Start"
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(event) => setPreferences((current) => ({ ...current, quiet_hours_start: event.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Quiet Hours End"
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(event) => setPreferences((current) => ({ ...current, quiet_hours_end: event.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Box>
                <Button variant="contained" onClick={() => void savePreferences()} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
