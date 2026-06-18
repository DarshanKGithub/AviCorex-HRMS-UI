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
  CircularProgress,
  Grid
} from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SyncIcon from '@mui/icons-material/Sync';
import SensorsIcon from '@mui/icons-material/Sensors';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE = getApiBaseUrl();

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};

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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FingerprintIcon sx={{ color: '#6366f1' }} /> 
          Biometric Integration
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4, textAlign: 'center', py: 6 }}>
                <SensorsIcon sx={{ fontSize: 64, color: '#10b981', mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 800, mb: 1 }}>Device Connectivity</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', mb: 3 }}>System is ready to receive logs from authenticated hardware devices.</Typography>
                
                <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'rgba(16, 185, 129, 0.1)', px: 2, py: 1, borderRadius: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', mr: 1, animation: 'pulse 2s infinite' }} />
                  <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>API Listening</Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 800, color: '#1e293b' }}>Manual Log Synchronization</Typography>
              <Typography sx={{ mb: 4, color: '#64748b', fontSize: '0.95rem' }}>
                Manually pull or inject biometric logs from the hardware device into the ecosystem. Useful for testing or overriding lost packets.
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
              
              <Stack spacing={4}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <TextField 
                    label="Device ID" 
                    fullWidth 
                    value={formData.device_id}
                    onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                    placeholder="e.g. BIO-HW-001"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafbfd'
                      }
                    }}
                  />
                  <TextField 
                    label="Employee ID" 
                    fullWidth 
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafbfd'
                      }
                    }}
                  />
                </Stack>
                
                <TextField 
                  select
                  SelectProps={{ native: true }}
                  label="Log Type (Punch Direction)" 
                  fullWidth 
                  value={formData.log_type}
                  onChange={(e) => setFormData({...formData, log_type: e.target.value})}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fafbfd'
                    }
                  }}
                >
                  <option value="IN">PUNCH IN</option>
                  <option value="OUT">PUNCH OUT</option>
                </TextField>
                
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                    onClick={handleManualSync}
                    disabled={syncing}
                    size="large"
                    sx={{ 
                      bgcolor: '#6366f1', 
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                      px: 4,
                      '&:hover': {
                        bgcolor: '#4f46e5'
                      }
                    }}
                  >
                    {syncing ? 'Syncing...' : 'Sync Log to System'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
