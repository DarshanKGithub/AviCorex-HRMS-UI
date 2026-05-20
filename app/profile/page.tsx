'use client';

import { useEffect, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 512;
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

async function resizeAvatarFile(file: File, maxDimension = MAX_AVATAR_DIMENSION): Promise<File> {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to process image');
  }

  context.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });

  if (!blob) {
    throw new Error('Unable to export image');
  }

  const normalizedName = file.name.replace(/\.[^/.]+$/, '') || 'avatar';
  return new File([blob], `${normalizedName}.jpg`, { type: 'image/jpeg' });
}

function toInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function resolveAvatarUrl(avatarUrl?: string | null): string | undefined {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  return `${API_BASE.replace(/\/$/, '')}/${avatarUrl.replace(/^\//, '')}`;
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
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarSourceFile, setAvatarSourceFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const initials = useMemo(() => toInitials(profile?.full_name ?? ''), [profile?.full_name]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

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

        const response = await fetch(`${API_BASE}/auth/me`, {
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
        // sync auth context user profile (avatar/name) if available
        try {
          authContext.updateUser({ full_name: data.full_name, avatar_url: data.avatar_url });
        } catch {}
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

      const response = await fetch(`${API_BASE}/auth/me`, {
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
      try {
        authContext.updateUser({ full_name: data.full_name });
        await authContext.refreshUser();
      } catch {}
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePickAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please use PNG, JPG, or WEBP.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Image is too large. Max size is 5MB.');
      return;
    }

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarSourceFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarDialogOpen(true);
  };

  const handleUploadAvatar = async () => {
    if (!avatarSourceFile) {
      return;
    }

    const token = authContext?.token;
    if (!token) {
      router.push('/login');
      return;
    }

    setAvatarUploading(true);
    setError('');
    setSuccess('');

    try {
      const resizedFile = await resizeAvatarFile(avatarSourceFile);
      const formData = new FormData();
      formData.append('avatar', resizedFile);

      const response = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.avatar_url) {
        throw new Error(payload?.detail || 'Failed to upload avatar');
      }

      setProfile((previous) => (previous ? { ...previous, avatar_url: payload.avatar_url } : previous));
      authContext.updateUser({ avatar_url: payload.avatar_url });
      setSuccess('Profile picture updated successfully');
      setAvatarDialogOpen(false);
      setAvatarSourceFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const token = authContext?.token;
    if (!token) {
      router.push('/login');
      return;
    }

    setAvatarUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || 'Failed to remove avatar');
      }

      setProfile((previous) => (previous ? { ...previous, avatar_url: null } : previous));
      authContext.updateUser({ avatar_url: null });
      setSuccess('Profile picture removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setAvatarUploading(false);
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar src={resolveAvatarUrl(profile.avatar_url)} sx={{ width: 72, height: 72, bgcolor: '#928ddd' }}>
                {initials}
              </Avatar>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handlePickAvatarFile}
                />
                <label htmlFor="avatar-upload">
                  <IconButton color="primary" aria-label="upload avatar" component="span">
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
                <IconButton aria-label="remove avatar" onClick={handleRemoveAvatar} disabled={avatarUploading || !profile.avatar_url}>
                  <DeleteIcon />
                </IconButton>
                {avatarUploading ? <CircularProgress size={20} /> : null}
              </Stack>
            </Box>
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

      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }} alignItems="center">
            <Avatar src={avatarPreviewUrl ?? resolveAvatarUrl(profile.avatar_url)} sx={{ width: 128, height: 128, bgcolor: '#928ddd' }}>
              {initials}
            </Avatar>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Image will be validated and resized to max {MAX_AVATAR_DIMENSION}px before upload.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAvatarDialogOpen(false);
              setAvatarSourceFile(null);
              if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
              }
              setAvatarPreviewUrl(null);
            }}
            disabled={avatarUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUploadAvatar} variant="contained" disabled={avatarUploading || !avatarSourceFile}>
            {avatarUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
