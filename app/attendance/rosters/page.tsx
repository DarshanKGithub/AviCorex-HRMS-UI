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
  Grid
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 4,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
  bgcolor: '#ffffff',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

export default function RostersPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rosterForm, setRosterForm] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoster = async () => {
    if (!rosterForm.name || !rosterForm.start_date || !rosterForm.end_date) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/advanced-attendance/rosters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rosterForm)
      });

      if (res.ok) {
        setSuccess('Roster created successfully!');
        setRosterForm({ name: '', start_date: '', end_date: '' });
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to create roster');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ color: '#6366f1' }} /> 
          Shift Roster Management
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={commonCardStyles}>
              <CardContent sx={{ p: 4, textAlign: 'center', py: 6 }}>
                <CalendarMonthIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 800, mb: 1 }}>Organize Your Team</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>Create distinct shift schedules and manage employee working hours with ease.</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 800, color: '#1e293b' }}>Create New Roster</Typography>
              <Typography sx={{ mb: 4, color: '#64748b', fontSize: '0.95rem' }}>Define a new shift roster block.</Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
              
              <Stack spacing={4}>
                <TextField 
                  label="Roster Name" 
                  fullWidth 
                  value={rosterForm.name}
                  onChange={(e) => setRosterForm({...rosterForm, name: e.target.value})}
                  placeholder="e.g. Q3 Night Shifts"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fafbfd'
                    }
                  }}
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <TextField 
                    label="Start Date" 
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth 
                    value={rosterForm.start_date}
                    onChange={(e) => setRosterForm({...rosterForm, start_date: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafbfd'
                      }
                    }}
                  />
                  <TextField 
                    label="End Date" 
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth 
                    value={rosterForm.end_date}
                    onChange={(e) => setRosterForm({...rosterForm, end_date: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafbfd'
                      }
                    }}
                  />
                </Stack>
                
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreateRoster}
                    disabled={loading}
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
                    {loading ? 'Creating...' : 'Create Roster'}
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
