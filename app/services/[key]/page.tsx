'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Button, TextField, Typography, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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

export default function ServiceEditPage() {
  const router = useRouter();
  const params = useParams();
  const key = params?.key as string;
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const services = readServices();
    const found = services.find((s) => s.key === key) || null;
    setService(found);
    if (found) {
      setLabel(found.label || '');
      setIcon(found.icon || 'dashboard');
    }
  }, [key]);

  const handleSave = () => {
    if (!service) return setError('Service not found');
    const services = readServices();
    const idx = services.findIndex((s) => s.key === key);
    if (idx === -1) return setError('Service not found');
    services[idx] = { ...services[idx], label, icon, updated_by: user?.id || null, updated_at: new Date().toISOString() };
    saveServices(services);
    router.push('/settings');
  };

  const handleDelete = () => {
    const services = readServices().filter((s) => s.key !== key);
    saveServices(services);
    router.push('/settings');
  };

  if (!service) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs
          items={[
            { label: 'Services', href: '/services' },
            { label: 'Service' }
          ]}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6">Service not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push('/settings')}>Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Services', href: '/services' },
          { label: service.label || 'Edit Service' }
        ]}
        sx={{ mb: 2 }}
      />
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Service — {service.label}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField label="Key" value={service.key} disabled fullWidth />
        <TextField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
        <TextField label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} fullWidth helperText="iconMap key" />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleSave}>Save</Button>
          <Button variant="outlined" onClick={() => router.push('/settings')}>Cancel</Button>
          <Button color="error" onClick={() => setConfirmOpen(true)}>Delete</Button>
        </Stack>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete service?</DialogTitle>
        <DialogContent>Are you sure you want to remove this service? This cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
