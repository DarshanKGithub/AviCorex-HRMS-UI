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
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const employeeEditSchema = z.object({
  full_name: z.string().min(2, "Full name is required (min 2 chars)"),
  email: z.string().email("Enter a valid email address"),
  department_id: z.string().optional().nullable().or(z.literal('')),
  designation_id: z.string().optional().nullable().or(z.literal('')),
  manager_id: z.string().optional().nullable().or(z.literal('')),
});

type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;

export default function EmployeesPage() {
  const auth = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [chainOpen, setChainOpen] = useState(false);
  const [managerChain, setManagerChain] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  const { data: deptsData = [] } = useQuery<Option[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/org/departments`, { headers: { Authorization: `Bearer ${auth.token}` } });
      if (!res.ok) throw new Error('Failed to fetch departments');
      return res.json();
    },
    enabled: !!auth.token,
    staleTime: 5 * 60 * 1000,
  });
  const departments = deptsData;

  const { data: desigsData = [] } = useQuery<Option[]>({
    queryKey: ['designations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/org/designations`, { headers: { Authorization: `Bearer ${auth.token}` } });
      if (!res.ok) throw new Error('Failed to fetch designations');
      return res.json();
    },
    enabled: !!auth.token,
    staleTime: 5 * 60 * 1000,
  });
  const designations = desigsData;

  const { data: employeesData, isLoading: loading } = useQuery({
    queryKey: ['employees', page, size, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (q) params.set('q', q);
      const res = await fetch(`${API_BASE_URL}/employees/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`Unable to fetch employees (${res.status})`);
      return res.json();
    },
    enabled: auth.status === 'ready' && !!auth.token,
  });
  const employees: Employee[] = employeesData?.items || [];
  const total: number = employeesData?.total || 0;


  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<EmployeeEditFormValues>({
    resolver: zodResolver(employeeEditSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      email: '',
      department_id: '',
      designation_id: '',
      manager_id: '',
    },
  });

  const canCreateEmployee = hasPermission('create_employee');
  const canEditEmployee = hasPermission('edit_employee');
  const canDeleteEmployee = hasPermission('delete_employee');
  const canModify = canEditEmployee || canDeleteEmployee;



  function handleDelete(id: string) {
    if (!canDeleteEmployee) return;
    setConfirmDeleteId(id);
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body && body.detail) || `Delete failed (${response.status})`);
      }
      return response.json();
    },
    onSuccess: () => {
      setToastMsg('Employee deleted');
      setToastSeverity('success');
      setToastOpen(true);
      const newTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / size));
      const desired = lastPage >= page ? page : lastPage;
      setPage(desired);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    }
  });
  const deletingId = deleteMutation.variables;
  async function handleDeleteConfirmed() {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    deleteMutation.mutate(id);
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



  function startEdit(emp: Employee) {
    if (!canEditEmployee) return;
    setEditingId(emp.id);
    reset({
      full_name: emp.full_name,
      email: emp.email,
      department_id: emp.department_id ?? '',
      designation_id: emp.designation_id ?? '',
      manager_id: emp.manager_id ?? '',
    });
  }

  function resetEdit() {
    setEditingId(null);
    reset();
  }

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: Record<string, unknown> }) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body && body.detail) || `Request failed (${response.status})`);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      setToastMsg('Employee updated');
      setToastSeverity('success');
      setToastOpen(true);
      const currentUserEmail = auth.user?.email?.toLowerCase();
      const editedEmail = (variables.payload.email as string).trim().toLowerCase();
      if (auth.user?.id === variables.id || currentUserEmail === editedEmail) {
        auth.updateUser({ full_name: (variables.payload.full_name as string).trim() });
        void auth.refreshUser();
      }
      resetEdit();
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    },
  });

  const saving = updateMutation.isPending;

  const handleSave = async (data: EmployeeEditFormValues) => {
    if (!canEditEmployee) {
      setToastMsg('You do not have permission to edit employees');
      setToastSeverity('error');
      setToastOpen(true);
      return;
    }

    if (!editingId) return;

    const payload: Record<string, unknown> = {
      full_name: data.full_name,
      email: data.email,
      department_id: data.department_id || null,
      designation_id: data.designation_id || null,
      manager_id: data.manager_id || null,
    };
    
    updateMutation.mutate({ id: editingId, payload });
  }

  // Function to handle the confirmed save action
  const doSaveConfirmed = async () => {
    setEditConfirmOpen(false);
    await handleSubmit(handleSave)();
  };

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
            <Button onClick={() => { setPage(1); setPage(1); }}>Search</Button>
            <Box sx={{ flex: 1 }} />
            <Typography>{`Page ${page} • ${total} total`}</Typography>
            <Button disabled={page <= 1} onClick={() => { const np = Math.max(1, page - 1); setPage(np); }}>Prev</Button>
            <Button disabled={page * size >= total} onClick={() => { const np = page + 1; setPage(np); }}>Next</Button>
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
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field}
                label="Full name" 
                fullWidth 
                error={!!errors.full_name} 
                helperText={errors.full_name?.message} 
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field}
                label="Work email" 
                fullWidth 
                error={!!errors.email} 
                helperText={errors.email?.message} 
                disabled
              />
            )}
          />
          <FormControl fullWidth>
            <InputLabel id="edit-dept-label">Department</InputLabel>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="edit-dept-label" label="Department">
                  <MenuItem value="">—</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-des-label">Designation</InputLabel>
            <Controller
              name="designation_id"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="edit-des-label" label="Designation">
                  <MenuItem value="">—</MenuItem>
                  {designations.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-manager-label">Manager</InputLabel>
            <Controller
              name="manager_id"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="edit-manager-label" label="Manager">
                  <MenuItem value="">—</MenuItem>
                  {employees.filter(e => e.id !== editingId).map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => resetEdit()}>Cancel</Button>
          <Button onClick={() => setEditConfirmOpen(true)} disabled={!isValid} variant="contained">Save Changes</Button>
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
