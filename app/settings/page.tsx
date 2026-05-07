'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

export default function SettingsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canEditProfile = hasPermission('edit_profile');

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to load
      if (authContext?.status === 'loading') {
        return;
      }

      if (!authContext?.isAuthenticated) {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [authContext?.isAuthenticated, authContext?.status, router]);

  const validatePasswords = () => {
    setError('');

    if (!oldPassword) {
      setError('Current password is required');
      return false;
    }

    if (!newPassword) {
      setError('New password is required');
      return false;
    }

    if (!confirmPassword) {
      setError('Password confirmation is required');
      return false;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!canEditProfile) {
      setError('You do not have permission to change password');
      return;
    }
    if (!validatePasswords()) {
      return;
    }

    setChanging(true);
    setError('');
    setSuccess('');

    try {
      const token = authContext?.token;
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  if (authContext?.status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Card>
        <CardHeader title="Settings" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ fontSize: '1rem', fontWeight: 600, mb: 3 }}>Change Password</Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {!canEditProfile && <Alert severity="warning" sx={{ mb: 2 }}>You do not have permission to update profile credentials.</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={changing || !canEditProfile}
              />

              <TextField
                fullWidth
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changing || !canEditProfile}
                helperText="Minimum 6 characters"
              />

              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changing || !canEditProfile}
              />

              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={changing || !canEditProfile}
                sx={{ mt: 2 }}
              >
                {changing ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Box sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>Other Settings</Box>
            <Box sx={{ color: '#666', fontSize: '0.875rem' }}>
              More settings coming in future phases...
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
