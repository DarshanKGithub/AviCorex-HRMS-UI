'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Stack, Alert } from '@mui/material';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

function readServices(): any[] {
  try {
    const raw = window.localStorage.getItem('hrms_services') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveServices(list: any[]) {
  window.localStorage.setItem('hrms_services', JSON.stringify(list));
}

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('dashboard');
  const [error, setError] = useState('');

  const handleCreate = () => {
    setError('');
    if (!key || !label) return setError('Key and label are required');
    const services = readServices();
    if (services.find((s) => s.key === key)) return setError('A service with this key already exists');
    services.push({ key, label, icon, created_by: user?.id || null, created_at: new Date().toISOString() });
    saveServices(services);
    router.push('/settings');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>Create New Service</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField label="Key (unique, used in URL)" value={key} onChange={(e) => setKey(e.target.value.trim())} fullWidth />
        <TextField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
        <TextField label="Icon (iconMap key)" value={icon} onChange={(e) => setIcon(e.target.value)} fullWidth helperText="Examples: dashboard, people, attendance" />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
          <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
