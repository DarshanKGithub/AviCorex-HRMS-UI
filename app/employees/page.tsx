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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState<string | ''>('');
  const [designationId, setDesignationId] = useState<string | ''>('');
  const [managerId, setManagerId] = useState<string | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const [chainOpen, setChainOpen] = useState(false);
  const [managerChain, setManagerChain] = useState<string[]>([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [designations, setDesignations] = useState<Option[]>([]);

  const canCreateEmployee = hasPermission('create_employee');
  const canEditEmployee = hasPermission('edit_employee');
  const canDeleteEmployee = hasPermission('delete_employee');
  const canModify = canCreateEmployee || canEditEmployee || canDeleteEmployee;

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
    if (!auth.token) return;
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
    setName(emp.full_name);
    setEmail(emp.email);
    setDepartmentId(emp.department_id ?? '');
    setDesignationId(emp.designation_id ?? '');
    setManagerId(emp.manager_id ?? '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Employee');
    setDepartmentId('');
    setDesignationId('');
    setManagerId('');
    setErrors({});
  }

  function validateForm() {
    const e: { name?: string; email?: string; password?: string } = {};
    if (!name || name.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) e.email = 'Enter a valid email address';
    if (!editingId && (!password || password.length < 6)) {
      e.password = 'Login password is required (min 6 characters)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Derived validity check (does not set state) to avoid calling validateForm() during render
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    !!name &&
    name.trim().length >= 2 &&
    !!email &&
    emailRegex.test(email) &&
    (editingId ? true : password.length >= 6);

  async function handleSave() {
    if (!validateForm()) return;

    if (editingId && !canEditEmployee) {
      setToastMsg('You do not have permission to edit employees');
      setToastSeverity('error');
      setToastOpen(true);
      return;
    }

    if (!editingId && !canCreateEmployee) {
      setToastMsg('You do not have permission to create employees');
      setToastSeverity('error');
      setToastOpen(true);
      return;
    }

    const payload: Record<string, unknown> = {
      full_name: name,
      email,
      department_id: departmentId || null,
      designation_id: designationId || null,
      manager_id: managerId || null,
    };
    if (!editingId) {
      payload.password = password;
      payload.role = role;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`${API_BASE_URL}/employees/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/employees/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        setToastMsg(editingId ? 'Employee updated' : 'Employee created');
        setToastSeverity('success');
        setToastOpen(true);
        resetForm();
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
    setSaveConfirmOpen(false);
    try {
      await handleSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Card>
        <CardHeader title="Employees" subheader="Manage employee master data" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>Employees</Typography>
              <Divider sx={{ mb: 1 }} />
              <List>
                {employees.map((emp) => (
                  <ListItem key={emp.id} disablePadding>
                    <ListItemButton component="a" href={`/employees/${emp.id}`}>
                      <ListItemText primary={emp.full_name} secondary={`${emp.email} • ${emp.is_active ? 'Active' : 'Inactive'}`} />
                    </ListItemButton>
                    {canModify && (
                      <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                        {canEditEmployee && (
                          <IconButton edge="end" onClick={() => startEdit(emp)} aria-label="edit"><EditRoundedIcon /></IconButton>
                        )}
                        {canDeleteEmployee && (
                          <IconButton edge="end" onClick={() => handleDelete(emp.id)} aria-label="delete"><DeleteRoundedIcon /></IconButton>
                        )}
                      </Stack>
                    )}
                  </ListItem>
                ))}
              </List>
              {!loading && employees.length === 0 && (
                <Typography sx={{ color: '#666' }}>No employees yet.</Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>{editingId ? 'Edit employee' : 'Create employee & login'}</Typography>
              <Divider sx={{ mb: 1 }} />
              {canModify ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {!editingId && (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Creates an employee profile and login account. The new hire signs in with the email and password below.
                    </Typography>
                  )}
                  <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth error={!!errors.name} helperText={errors.name} />
                  <TextField label="Work email (login)" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth error={!!errors.email} helperText={errors.email} disabled={!!editingId} />
                  {!editingId && (
                    <>
                      <TextField
                        label="Login password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password || 'Minimum 6 characters — share securely with the employee'}
                      />
                      <FormControl fullWidth>
                        <InputLabel id="role-label">Login role</InputLabel>
                        <Select labelId="role-label" label="Login role" value={role} onChange={(e) => setRole(e.target.value)}>
                          <MenuItem value="Employee">Employee</MenuItem>
                          <MenuItem value="Worker">Worker</MenuItem>
                          <MenuItem value="Manager">Manager</MenuItem>
                        </Select>
                        <FormHelperText>Controls which menus and actions they can access after login</FormHelperText>
                      </FormControl>
                    </>
                  )}
                  <FormControl>
                    <InputLabel id="manager-label">Manager</InputLabel>
                    <Select labelId="manager-label" label="Manager" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      {employees.filter(e => e.id !== editingId).map((m) => (
                        <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel id="dept-label">Department</InputLabel>
                    <Select labelId="dept-label" label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel id="des-label">Designation</InputLabel>
                    <Select labelId="des-label" label="Designation" value={designationId} onChange={(e) => setDesignationId(e.target.value)}>
                      <MenuItem value="">—</MenuItem>
                      {designations.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => setSaveConfirmOpen(true)}
                      disabled={!isFormValid || (editingId ? !canEditEmployee : !canCreateEmployee)}
                    >
                      {editingId ? 'Save' : 'Add'}
                    </Button>
                    {editingId && (
                      <Button variant="outlined" startIcon={<CloseRoundedIcon />} onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Box>
              ) : (
                <Typography sx={{ color: '#666' }}>You do not have permission to create or edit employees.</Typography>
              )}
            </Grid>
          </Grid>

          {/* Search and pagination controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
            <TextField size="small" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <PersonSearchRoundedIcon sx={{ mr: 1 }} /> }} />
            <Button onClick={() => { setPage(1); fetchEmployees(1); }}>Search</Button>
            <Box sx={{ flex: 1 }} />
            <Typography>{`Page ${page} • ${total} total`}</Typography>
            <Button disabled={page <= 1} onClick={() => { const np = Math.max(1, page - 1); setPage(np); fetchEmployees(np); }}>Prev</Button>
            <Button disabled={page * size >= total} onClick={() => { const np = page + 1; setPage(np); fetchEmployees(np); }}>Next</Button>
          </Box>

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

          <Dialog open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)}>
            <DialogTitle>{editingId ? 'Confirm save' : 'Confirm create'}</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to {editingId ? 'save changes to' : 'create'} this employee?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSaveConfirmOpen(false)}>Cancel</Button>
              <Button onClick={doSaveConfirmed} disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Confirm'}</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
}
