'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Container, TextField, Alert, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

      // Fetch profile
      try {
        const token = authContext?.token;
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        setFullName(data.full_name);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [authContext?.isAuthenticated, authContext?.status, authContext?.token, router]);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const token = authContext?.token;
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (authContext?.status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load profile. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardHeader title="My Profile" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ fontSize: '0.875rem', color: '#666' }}>Full Name</Box>
                {!isEditing && (
                  <Button size="small" variant="text" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  size="small"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
              ) : (
                <Box sx={{ fontWeight: 500 }}>{profile.full_name}</Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>Email</Box>
              <Box sx={{ fontWeight: 500 }}>{profile.email}</Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>Role</Box>
              <Chip label={profile.role} color="primary" variant="outlined" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>ID</Box>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#666' }}>{profile.id}</Box>
            </Box>
          </Box>

          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                disabled={updating}
                sx={{ flex: 1 }}
              >
                {updating ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFullName(profile.full_name);
                  setIsEditing(false);
                  setError('');
                }}
                disabled={updating}
              >
                Cancel
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
