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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" />
          Roster Management
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px -12px rgba(0, 0, 0, 0.08)', maxWidth: 800 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#0f172a' }}>Create New Roster</Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField 
              label="Roster Name" 
              fullWidth 
              value={rosterForm.name}
              onChange={(e) => setRosterForm({...rosterForm, name: e.target.value})}
              placeholder="e.g. Q3 Night Shifts"
            />
            <TextField 
              label="Start Date" 
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth 
              value={rosterForm.start_date}
              onChange={(e) => setRosterForm({...rosterForm, start_date: e.target.value})}
            />
            <TextField 
              label="End Date" 
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth 
              value={rosterForm.end_date}
              onChange={(e) => setRosterForm({...rosterForm, end_date: e.target.value})}
            />
          </Stack>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateRoster}
            disabled={loading}
            size="large"
            sx={{ 
              bgcolor: '#3b82f6', 
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
            {loading ? 'Creating...' : 'Create Roster'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
