'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Button, Chip } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function WorkflowFormsPage() {
  const { token, user, status } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.push('/login');
      return;
    }
    if (status === 'ready' && user && !hasPermission('manage_workflows')) {
      router.push('/dashboard');
      return;
    }
    if (token) {
      fetchData();
    }
  }, [hasPermission, status, token, router, user]);

  async function fetchData() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [wfRes, formRes] = await Promise.all([
        fetch(`${API_BASE}/workflow/templates`, { headers }),
        fetch(`${API_BASE}/workflow/forms`, { headers })
      ]);

      if (wfRes.ok) setWorkflows(await wfRes.json());
      if (formRes.ok) setForms(await formRes.json());
    } catch (e: any) {
      setError('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExtensionIcon color="primary" />
          Dynamic Workflows & Forms
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#2563EB', textTransform: 'none' }}>
            New Template
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Tab label="Workflow Templates" icon={<ExtensionIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Form Builder" icon={<WebAssetIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Workflow Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trigger Event</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No workflow templates found.
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((wf) => (
                  <TableRow key={wf.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{wf.name}</TableCell>
                    <TableCell><Chip label={wf.trigger_event} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }} /></TableCell>
                    <TableCell><Chip label={wf.is_active ? 'Active' : 'Inactive'} size="small" color={wf.is_active ? 'success' : 'default'} /></TableCell>
                    <TableCell>{new Date(wf.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : forms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No dynamic forms found.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{f.name}</TableCell>
                    <TableCell>{f.description || '-'}</TableCell>
                    <TableCell><Chip label={f.is_active ? 'Active' : 'Inactive'} size="small" color={f.is_active ? 'success' : 'default'} /></TableCell>
                    <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
