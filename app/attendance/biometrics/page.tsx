'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SyncIcon from '@mui/icons-material/Sync';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function BiometricsPage() {
  const { token, user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    device_id: '',
    log_type: 'IN',
    employee_id: user?.id || ''
  });

  const handleManualSync = async () => {
    if (!formData.device_id || !formData.employee_id) {
      setError("Please fill all required fields");
      return;
    }

    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      const res = await fetch(`${API_BASE}/advanced-attendance/biometrics/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Biometric log synchronized successfully.');
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to sync biometric log');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FingerprintIcon color="primary" />
          Biometric & Device Integration
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px -12px rgba(0, 0, 0, 0.08)', maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>Manual Log Synchronization</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Manually pull or inject biometric logs from the hardware device into the HRMS ecosystem.
          </Typography>

          <Stack spacing={3}>
            <TextField 
              label="Device ID" 
              fullWidth 
              value={formData.device_id}
              onChange={(e) => setFormData({...formData, device_id: e.target.value})}
              placeholder="e.g. BIO-HW-001"
            />
            
            <TextField 
              label="Employee ID" 
              fullWidth 
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
            />

            <TextField 
              select
              SelectProps={{ native: true }}
              label="Log Type" 
              fullWidth 
              value={formData.log_type}
              onChange={(e) => setFormData({...formData, log_type: e.target.value})}
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </TextField>

            <Button 
              variant="contained" 
              size="large"
              startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
              onClick={handleManualSync}
              disabled={syncing}
              sx={{ 
                bgcolor: '#3b82f6', 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)'
                }
              }}
            >
              Sync Log to System
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
