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
  Grid,
  TextField,
  Alert,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { iconMap } from '@/components/shell/iconMapping';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import { getApiBaseUrl } from '@/lib/apiBase';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

const API_BASE = getApiBaseUrl();
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

export default function SettingsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const { hasPermission } = usePermissions();
  
  // Profile State
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

  // Password State
  const [changing, setChanging] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const canEditProfile = hasPermission('edit_profile');
  const isAdmin = hasPermission('manage_settings');

  const initials = useMemo(() => toInitials(profile?.full_name ?? ''), [profile?.full_name]);

  const SERVICES = [
    { key: 'manage-accounts', label: 'Manage Accounts', icon: 'people' },
    { key: 'onboarding', label: 'Onboarding', icon: 'engage' },
    { key: 'employee-info', label: 'Employee Information', icon: 'employees' },
    { key: 'leave-tracker', label: 'Leave Tracker', icon: 'leave' },
    { key: 'attendance', label: 'Attendance', icon: 'attendance' },
    { key: 'shifts', label: 'Shifts', icon: 'calendar' },
    { key: 'time-tracker', label: 'Time Tracker', icon: 'time' },
    { key: 'performance', label: 'Performance', icon: 'performance' },
    { key: 'files', label: 'Files', icon: 'docs' },
    { key: 'engagement', label: 'Employee Engagement', icon: 'engagement' },
    { key: 'hr-letters', label: 'HR Letters', icon: 'docs' },
    { key: 'travel', label: 'Travel', icon: 'worklife' },
    { key: 'tasks', label: 'Tasks', icon: 'todo' },
    { key: 'compensation', label: 'Compensation', icon: 'payroll' },
    { key: 'general', label: 'General', icon: 'settings' },
    { key: 'offboarding', label: 'Offboarding', icon: 'workflow' },
    { key: 'marketplace', label: 'Marketplace', icon: 'dashboard' },
    { key: 'developer-space', label: 'Developer Space', icon: 'helpdesk' },
    { key: 'zia', label: 'Zia', icon: 'worklife' }
  ];

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    const checkAuth = async () => {
      if (authContext?.status === 'loading') {
        return;
      }

      if (!authContext?.isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const token = authContext?.token;
        if (!token) return;

        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setProfile(data);
        setFullName(data.full_name);
        try {
          authContext.updateUser({ full_name: data.full_name, avatar_url: data.avatar_url });
        } catch {}
      } catch (err) {
        setError('Failed to load profile');
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
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

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
    if (!file) return;

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

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);

    setAvatarSourceFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarDialogOpen(true);
  };

  const handleUploadAvatar = async () => {
    if (!avatarSourceFile) return;

    const token = authContext?.token;
    if (!token) return;

    setAvatarUploading(true);
    setError('');
    setSuccess('');

    try {
      const resizedFile = await resizeAvatarFile(avatarSourceFile);
      const formData = new FormData();
      formData.append('avatar', resizedFile);

      const response = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.avatar_url) {
        throw new Error(payload?.detail || 'Failed to upload avatar');
      }

      setProfile((prev) => (prev ? { ...prev, avatar_url: payload.avatar_url } : prev));
      authContext.updateUser({ avatar_url: payload.avatar_url });
      setSuccess('Profile picture updated successfully');
      setAvatarDialogOpen(false);
      setAvatarSourceFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const token = authContext?.token;
    if (!token) return;

    setAvatarUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || 'Failed to remove avatar');

      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
      authContext.updateUser({ avatar_url: null });
      setSuccess('Profile picture removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const validatePasswords = () => {
    setPasswordError('');
    if (!oldPassword) { setPasswordError('Current password is required'); return false; }
    if (!newPassword) { setPasswordError('New password is required'); return false; }
    if (!confirmPassword) { setPasswordError('Password confirmation is required'); return false; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return false; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return false; }
    if (oldPassword === newPassword) { setPasswordError('New password must be different from current password'); return false; }
    return true;
  };

  const handleChangePassword = async () => {
    if (!canEditProfile) {
      setPasswordError('You do not have permission to change password');
      return;
    }
    if (!validatePasswords()) return;

    setChanging(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const token = authContext?.token;
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
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

  if (!profile) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>Failed to load profile. Please try again.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }} />
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Settings & Profile
        </Typography>
        <Typography sx={{ color: '#64748b' }}>
          Manage your account information, update your profile picture, and change your password.
        </Typography>
      </Box>

      {/* Profile Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)', mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ fontSize: '1.25rem', fontWeight: 800, mb: 3, color: '#1e293b' }}>Profile Information</Box>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                <Avatar src={resolveAvatarUrl(profile.avatar_url)} sx={{ width: 120, height: 120, bgcolor: '#928ddd', fontSize: 32 }}>
                  {initials}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.full_name}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{profile.role}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <label htmlFor="avatar-upload">
                    <input
                      accept="image/*"
                      id="avatar-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handlePickAvatarFile}
                    />
                    <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                      Upload
                    </Button>
                  </label>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading || !profile.avatar_url}
                    startIcon={<DeleteIcon />}
                  >
                    Remove
                  </Button>
                </Box>
                {avatarUploading && <CircularProgress size={24} />}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>Full Name</Typography>
                    {!isEditing && (
                      <Button size="small" variant="text" onClick={() => setIsEditing(true)}>Edit</Button>
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
                    <Typography sx={{ fontWeight: 500 }}>{profile.full_name}</Typography>
                  )}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>Email</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{profile.email}</Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>Role</Typography>
                  <Chip label={profile.role} color="primary" variant="outlined" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>ID</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#666' }}>{profile.id}</Typography>
                </Box>

                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={handleUpdateProfile} disabled={updating} sx={{ minWidth: 120 }}>
                      {updating ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outlined" onClick={() => { setFullName(profile.full_name); setIsEditing(false); setError(''); }} disabled={updating}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)', mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ fontSize: '1.25rem', fontWeight: 800, mb: 3, color: '#1e293b' }}>Change Password</Box>

          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          {!canEditProfile && <Alert severity="warning" sx={{ mb: 2 }}>You do not have permission to update profile credentials.</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
                  sx={{ mt: 1, width: 'fit-content' }}
                >
                  {changing ? 'Changing...' : 'Update Password'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Avatar Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }} alignItems="center">
            <Avatar src={avatarPreviewUrl ?? resolveAvatarUrl(profile.avatar_url)} sx={{ width: 128, height: 128, bgcolor: '#928ddd', fontSize: 36 }}>
              {initials}
            </Avatar>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Image will be validated and resized to max {MAX_AVATAR_DIMENSION}px before upload.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAvatarDialogOpen(false); setAvatarSourceFile(null); if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl); setAvatarPreviewUrl(null); }} disabled={avatarUploading}>Cancel</Button>
          <Button onClick={handleUploadAvatar} variant="contained" disabled={avatarUploading || !avatarSourceFile}>{avatarUploading ? 'Uploading...' : 'Upload'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
