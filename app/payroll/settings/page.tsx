'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';
import { API_BASE_URL } from '@/lib/apiBase';

interface SalaryComponent {
  id: string;
  name: string;
  component_type: string;
  description: string | null;
  is_active: boolean;
}

export default function PayrollSettingsPage() {
  const { token, user } = useAuth();
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [componentType, setComponentType] = useState('earning');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManageSettings = user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Super Admin';

  const loadComponents = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/payroll/components`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load salary components');
      const data = await res.json();
      setComponents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, [token]);

  const handleOpenDialog = (comp?: SalaryComponent) => {
    if (comp) {
      setEditingId(comp.id);
      setName(comp.name);
      setComponentType(comp.component_type);
      setDescription(comp.description || '');
      setIsActive(comp.is_active);
    } else {
      setEditingId(null);
      setName('');
      setComponentType('earning');
      setDescription('');
      setIsActive(true);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      const url = editingId 
        ? `${API_BASE_URL}/payroll/components/${editingId}`
        : `${API_BASE_URL}/payroll/components`;
        
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        name,
        component_type: componentType,
        description,
        is_active: isActive
      };
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save component');
      
      await loadComponents();
      setDialogOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/payroll/components/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete component');
      await loadComponents();
      setDeleteDialogOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!canManageSettings) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">You do not have permission to view this page.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs items={[{ label: 'Payroll', href: '/payroll' }, { label: 'Settings' }]} />
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, mt: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payroll Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage custom salary components, earnings, and deductions for your company.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddRoundedIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Component
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {components.length === 0 && (
            <Grid item xs={12}>
              <Card><CardContent><Typography color="text.secondary">No salary components found.</Typography></CardContent></Card>
            </Grid>
          )}
          {components.map((comp) => (
            <Grid item xs={12} md={6} lg={4} key={comp.id}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">{comp.name}</Typography>
                    <Chip 
                      label={comp.component_type} 
                      color={comp.component_type === 'earning' ? 'success' : comp.component_type === 'deduction' ? 'error' : 'warning'} 
                      size="small" 
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {comp.description || 'No description provided.'}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">Status:</Typography>
                    <Chip label={comp.is_active ? 'Active' : 'Inactive'} size="small" variant="outlined" color={comp.is_active ? 'success' : 'default'} />
                  </Stack>
                </CardContent>
                <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(comp)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(comp.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Salary Component' : 'Add Salary Component'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Component Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., House Rent Allowance"
            />
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={componentType}
                label="Type"
                onChange={(e) => setComponentType(e.target.value)}
              >
                <MenuItem value="earning">Earning</MenuItem>
                <MenuItem value="deduction">Deduction</MenuItem>
                <MenuItem value="tax">Tax</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Active Status</Typography>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Component</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this salary component?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
