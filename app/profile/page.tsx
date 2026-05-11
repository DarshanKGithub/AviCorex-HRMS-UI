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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
  Skeleton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  personal_email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  pan_number?: string;
  aadhar_number?: string;
  joining_date?: string;
  date_of_confirmation?: string;
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarSourceFile, setAvatarSourceFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

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
        setFormData(data);
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
    if (!formData.full_name?.trim()) {
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

      // Build update payload - only include fields that have been edited
      const updatePayload: Record<string, any> = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        personal_email: formData.personal_email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        country: formData.country || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        bank_account_number: formData.bank_account_number || null,
        bank_ifsc_code: formData.bank_ifsc_code || null,
        pan_number: formData.pan_number || null,
        aadhar_number: formData.aadhar_number || null,
        joining_date: formData.joining_date || null,
        date_of_confirmation: formData.date_of_confirmation || null,
      };

      const response = await fetch(`${API_BASE}/employees/${profile?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData(data);
      setSuccess('Profile updated successfully');
      try { authContext.updateUser({ full_name: data.full_name }); } catch {}
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
      <Container maxWidth="md">
        <Box sx={{ mt: 6 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={28} width="40%" sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={14} width="60%" sx={{ mb: 3 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Container>
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

  const renderField = (label: string, field: keyof ProfileData, type: string = 'text') => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>
        {label}
      </Typography>
      {isEditing ? (
        <TextField
          fullWidth
          size="small"
          type={type}
          value={formData[field] || ''}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          InputLabelProps={type === 'date' ? { shrink: true } : {}}
        />
      ) : (
        <Box sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
          {formData[field] ? (
            type === 'date' ? new Date(formData[field] as string).toLocaleDateString() : formData[field]
          ) : (
            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>Not provided</Typography>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Card>
        <CardHeader title="My Profile" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Avatar Section */}
          <Box sx={{ borderBottom: '1px solid #e5e7eb', pb: 3 }}>
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
          </Box>

          {/* Basic Info Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Basic Information
            </Typography>
            {renderField('Full Name', 'full_name')}
            {renderField('Email', 'email')}
            {renderField('Personal Email', 'personal_email')}
            {renderField('Phone', 'phone')}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>Role</Typography>
              <Chip label={profile.role} color="primary" variant="outlined" sx={{ mt: 0.5 }} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 0.5 }}>ID</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#666' }}>
                {profile.id}
              </Typography>
            </Box>
          </Box>

          {/* Tabs for Additional Fields */}
          <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
            <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
              <Tab label="Personal" />
              <Tab label="Address" />
              <Tab label="Emergency Contact" />
              <Tab label="Financial" />
              <Tab label="Employment" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box>
            {/* Personal Tab */}
            {tabIndex === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Personal Information
                </Typography>
                {renderField('Date of Birth', 'date_of_birth', 'date')}
                {renderField('Gender', 'gender')}
              </Box>
            )}

            {/* Address Tab */}
            {tabIndex === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Address Information
                </Typography>
                {renderField('Address', 'address')}
                {renderField('City', 'city')}
                {renderField('State', 'state')}
                {renderField('Zip Code', 'zip_code')}
                {renderField('Country', 'country')}
              </Box>
            )}

            {/* Emergency Contact Tab */}
            {tabIndex === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Emergency Contact Information
                </Typography>
                {renderField('Contact Name', 'emergency_contact_name')}
                {renderField('Contact Phone', 'emergency_contact_phone')}
                {renderField('Relationship', 'emergency_contact_relationship')}
              </Box>
            )}

            {/* Financial Tab */}
            {tabIndex === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Financial Information
                </Typography>
                {renderField('Bank Account Number', 'bank_account_number')}
                {renderField('Bank IFSC Code', 'bank_ifsc_code')}
                {renderField('PAN Number', 'pan_number')}
                {renderField('Aadhar Number', 'aadhar_number')}
              </Box>
            )}

            {/* Employment Tab */}
            {tabIndex === 4 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Employment Information
                </Typography>
                {renderField('Joining Date', 'joining_date', 'date')}
                {renderField('Date of Confirmation', 'date_of_confirmation', 'date')}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  sx={{ flex: 1 }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                    setError('');
                  }}
                  disabled={updating}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                sx={{ flex: 1 }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Avatar Dialog */}
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
