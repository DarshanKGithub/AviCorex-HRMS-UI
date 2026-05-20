"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { API_BASE_URL } from '@/lib/apiBase';

type Employee = {
  id: string;
  full_name: string;
  email: string;
  department_id?: string | null;
  designation_id?: string | null;
  manager_id?: string | null;
  is_active: boolean;
};

type Option = { id: string; name: string };

export default function EmployeesPage() {
  const auth = useAuth();
  const { hasPermission } = usePermissions();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState<string | ''>('');
  const [editDesignationId, setEditDesignationId] = useState<string | ''>('');
  const [editManagerId, setEditManagerId] = useState<string | ''>('');
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({});
  const [chainOpen, setChainOpen] = useState(false);
  const [managerChain, setManagerChain] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [designations, setDesignations] = useState<Option[]>([]);

  const canCreateEmployee = hasPermission('create_employee');
  const canEditEmployee = hasPermission('edit_employee');
  const canDeleteEmployee = hasPermission('delete_employee');
  const canModify = canEditEmployee || canDeleteEmployee;

  useEffect(() => {
    if (auth.status === 'loading') return;
    fetchLookups();
    fetchEmployees();
  }, [auth.status]);

  async function fetchLookups() {
    try {
      const headers: Record<string, string> = {};
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const [dres, rres] = await Promise.all([
        fetch(`${API_BASE_URL}/org/departments`, { headers }),
        fetch(`${API_BASE_URL}/org/designations`, { headers }),
      ]);
      if (dres.ok) setDepartments(await dres.json());
      if (rres.ok) setDesignations(await rres.json());
    } catch (e) {
      // ignore
    }
  }

  function handleDelete(id: string) {
    if (!canDeleteEmployee) return;
    setConfirmDeleteId(id);
  }

  async function handleDeleteConfirmed() {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    setDeletingId(id);
    if (!auth.token) {
      setToastMsg('Authentication error');
      setToastSeverity('error');
      setToastOpen(true);
      setDeletingId(null);
      return;
    }
    try {
      const response: Response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.ok) {
        setToastMsg('Employee deleted');
        setToastSeverity('success');
        setToastOpen(true);
        // refresh page (if last item on page removed, go back a page)
        const newTotal = Math.max(0, total - 1);
        const lastPage = Math.max(1, Math.ceil(newTotal / size));
        const desired = lastPage >= page ? page : lastPage;
        setPage(desired);
        await fetchEmployees();
      } else {
        const body = await response.json().catch(() => ({}));
        setToastMsg((body && body.detail) || `Delete failed (${response.status})`);
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setDeletingId(null);
    }
  }

  async function fetchManagerChain(startId: string) {
    const chain: string[] = [];
    let current: string | null = startId;
    try {
      while (current) {
        const headers: Record<string, string> = {};
        if (auth.token) {
          headers.Authorization = `Bearer ${auth.token}`;
        }
        const response: Response = await fetch(`${API_BASE_URL}/employees/${current}`, { headers });
        if (!response.ok) break;
        const data = await response.json();
        chain.push(`${data.full_name} (${data.email})`);
        current = data.manager_id || null;
      }
    } catch {
      // ignore
    }
    setManagerChain(chain);
    setChainOpen(true);
  }

  async function fetchEmployees(p?: number) {
    const usedPage = p ?? page;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(usedPage));
      params.set('size', String(size));
      if (q) params.set('q', q);

      const headers: Record<string, string> = {};
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const res = await fetch(`${API_BASE_URL}/employees/?${params.toString()}`, { headers });
      if (res.ok) {
        const body = await res.json();
        setEmployees(body.items || []);
        setTotal(body.total || 0);
        setPage(body.page || usedPage);
      } else {
        const body = await res.json().catch(() => ({}));
        setToastMsg((body && body.detail) || `Unable to fetch employees (${res.status})`);
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Failed to fetch employees');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(emp: Employee) {
    if (!canEditEmployee) return;
    setEditingId(emp.id);
    setEditName(emp.full_name);
    setEditEmail(emp.email);
    setEditDepartmentId(emp.department_id ?? '');
    setEditDesignationId(emp.designation_id ?? '');
    setEditManagerId(emp.manager_id ?? '');
  }

  function resetEdit() {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditDepartmentId('');
    setEditDesignationId('');
    setEditManagerId('');
    setEditErrors({});
  }

  function validateEditForm() {
    const e: { name?: string; email?: string } = {};
    if (!editName || editName.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail || !emailRegex.test(editEmail)) e.email = 'Enter a valid email address';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEditFormValid =
    !!editName &&
    editName.trim().length >= 2 &&
    !!editEmail &&
    emailRegex.test(editEmail);

  async function handleSave() {
    if (!validateEditForm()) return;

    if (!canEditEmployee) {
      setToastMsg('You do not have permission to edit employees');
      setToastSeverity('error');
      setToastOpen(true);
      return;
    }

    const payload: Record<string, unknown> = {
      full_name: editName,
      email: editEmail,
      department_id: editDepartmentId || null,
      designation_id: editDesignationId || null,
      manager_id: editManagerId || null,
    };
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/employees/${editingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setToastMsg('Employee updated');
        setToastSeverity('success');
        setToastOpen(true);
        const currentUserEmail = auth.user?.email?.toLowerCase();
        const editedEmail = editEmail.trim().toLowerCase();
        if (auth.user?.id === editingId || currentUserEmail === editedEmail) {
          auth.updateUser({ full_name: editName.trim() });
          void auth.refreshUser();
        }
        resetEdit();
        fetchEmployees();
      } else {
        const body = await res.json().catch(() => ({}));
        setToastMsg((body && body.detail) || `Request failed (${res.status})`);
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    }
  }

  // Function to handle the confirmed save action
  async function doSaveConfirmed() {
    setSaving(true);
    setEditConfirmOpen(false);
    try {
      await handleSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs />
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Employees</Typography>
        {canCreateEmployee && (
          <Button 
            variant="contained" 
            startIcon={<AddRoundedIcon />}
            onClick={() => window.location.href = '/employees/create'}
          >
            Create Employee
          </Button>
        )}
      </Stack>

      <Card>
        <CardHeader title="Employee Directory" subheader="View and manage all employees" />
        <CardContent>
          <List>
            {employees.map((emp) => (
              <ListItem key={emp.id} disablePadding sx={{ mb: 1, border: '1px solid #e5e7eb', borderRadius: 1, p: 1 }}>
                <ListItemButton component="a" href={`/employees/${emp.id}`}>
                  <ListItemText 
                    primary={emp.full_name} 
                    secondary={`${emp.email} • ${emp.is_active ? 'Active' : 'Inactive'}`} 
                  />
                </ListItemButton>
                {canModify && (
                  <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                    {canEditEmployee && (
                      <IconButton edge="end" onClick={() => startEdit(emp)} aria-label="edit" size="small">
                        <EditRoundedIcon />
                      </IconButton>
                    )}
                    {canDeleteEmployee && (
                      <IconButton edge="end" onClick={() => handleDelete(emp.id)} aria-label="delete" size="small">
                        <DeleteRoundedIcon />
                      </IconButton>
                    )}
                  </Stack>
                )}
              </ListItem>
            ))}
          </List>
          {!loading && employees.length === 0 && (
            <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No employees yet.</Typography>
          )}

          {/* Search and pagination controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
            <TextField size="small" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <PersonSearchRoundedIcon sx={{ mr: 1 }} /> }} />
            <Button onClick={() => { setPage(1); fetchEmployees(1); }}>Search</Button>
            <Box sx={{ flex: 1 }} />
            <Typography>{`Page ${page} • ${total} total`}</Typography>
            <Button disabled={page <= 1} onClick={() => { const np = Math.max(1, page - 1); setPage(np); fetchEmployees(np); }}>Prev</Button>
            <Button disabled={page * size >= total} onClick={() => { const np = page + 1; setPage(np); fetchEmployees(np); }}>Next</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialogs and Snackbar */}
      <Dialog open={chainOpen} onClose={() => setChainOpen(false)}>
        <DialogTitle>Manager Chain</DialogTitle>
        <DialogContent>
          {managerChain.length === 0 ? (
            <Typography sx={{ color: '#666' }}>No manager chain available.</Typography>
          ) : (
            managerChain.map((m, i) => (
              <Typography key={i}>{`${i + 1}. ${m}`}</Typography>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChainOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editingId !== null} onClose={() => resetEdit()} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField 
            label="Full name" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)} 
            fullWidth 
            error={!!editErrors.name} 
            helperText={editErrors.name} 
          />
          <TextField 
            label="Work email" 
            value={editEmail} 
            onChange={(e) => setEditEmail(e.target.value)} 
            fullWidth 
            error={!!editErrors.email} 
            helperText={editErrors.email} 
            disabled
          />
          <FormControl fullWidth>
            <InputLabel id="edit-dept-label">Department</InputLabel>
            <Select labelId="edit-dept-label" label="Department" value={editDepartmentId} onChange={(e) => setEditDepartmentId(e.target.value)}>
              <MenuItem value="">—</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-des-label">Designation</InputLabel>
            <Select labelId="edit-des-label" label="Designation" value={editDesignationId} onChange={(e) => setEditDesignationId(e.target.value)}>
              <MenuItem value="">—</MenuItem>
              {designations.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-manager-label">Manager</InputLabel>
            <Select labelId="edit-manager-label" label="Manager" value={editManagerId} onChange={(e) => setEditManagerId(e.target.value)}>
              <MenuItem value="">—</MenuItem>
              {employees.filter(e => e.id !== editingId).map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => resetEdit()}>Cancel</Button>
          <Button onClick={() => setEditConfirmOpen(true)} disabled={!isEditFormValid} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editConfirmOpen} onClose={() => setEditConfirmOpen(false)}>
        <DialogTitle>Confirm save</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to save changes to this employee?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditConfirmOpen(false)}>Cancel</Button>
          <Button onClick={doSaveConfirmed} disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Confirm'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this employee? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} disabled={!!deletingId} color="error">{deletingId ? <CircularProgress size={18} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toastOpen} autoHideDuration={6000} onClose={() => setToastOpen(false)}>
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
