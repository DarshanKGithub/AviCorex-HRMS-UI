"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { API_BASE_URL } from '@/lib/apiBase';

type Option = { id: string; name: string };

export default function CreateEmployeePage() {
  const auth = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [departmentId, setDepartmentId] = useState<string | ''>('');
  const [designationId, setDesignationId] = useState<string | ''>('');
  const [managerId, setManagerId] = useState<string | ''>('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [designations, setDesignations] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Check permissions
  if (auth.status === 'ready' && !hasPermission('create_employee')) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs />
        <Card>
          <CardContent>
            <Typography color="error">
              You do not have permission to create employees.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Fetch lookups
  if (departments.length === 0 && auth.token) {
    (async () => {
      try {
        const headers: Record<string, string> = { Authorization: `Bearer ${auth.token}` };
        const [dres, rres, eres] = await Promise.all([
          fetch(`${API_BASE_URL}/org/departments`, { headers }),
          fetch(`${API_BASE_URL}/org/designations`, { headers }),
          fetch(`${API_BASE_URL}/employees/?page=1&size=1000`, { headers }),
        ]);
        if (dres.ok) setDepartments(await dres.json());
        if (rres.ok) setDesignations(await rres.json());
        if (eres.ok) {
          const body = await eres.json();
          setEmployees(body.items || []);
        }
      } catch (e) {
        // ignore
      }
    })();
  }

  function validateForm() {
    const e: { name?: string; email?: string; password?: string } = {};
    if (!name || name.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) e.email = 'Enter a valid email address';
    if (!password || password.length < 6) {
      e.password = 'Login password is required (min 6 characters)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    !!name &&
    name.trim().length >= 2 &&
    !!email &&
    emailRegex.test(email) &&
    password.length >= 6;

  async function handleCreate() {
    if (!validateForm()) return;
    if (!auth.token) return;

    const payload: Record<string, unknown> = {
      full_name: name,
      email,
      password,
      role,
      department_id: departmentId || null,
      designation_id: designationId || null,
      manager_id: managerId || null,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/employees/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setToastMsg('Employee created successfully!');
        setToastSeverity('success');
        setToastOpen(true);
        setTimeout(() => {
          router.push('/employees');
        }, 1500);
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

  async function handleSaveConfirmed() {
    setSaving(true);
    setConfirmOpen(false);
    try {
      await handleCreate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Card>
        <CardHeader 
          title="Create New Employee" 
          subheader="Create employee profile and login account"
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Creates an employee profile and login account. The new hire signs in with the email and password below.
            </Typography>

            <TextField 
              label="Full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              fullWidth 
              error={!!errors.name} 
              helperText={errors.name} 
            />
            
            <TextField 
              label="Work email (login)" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
              error={!!errors.email} 
              helperText={errors.email} 
            />

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

            <FormControl fullWidth>
              <InputLabel id="dept-label">Department</InputLabel>
              <Select labelId="dept-label" label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <MenuItem value="">—</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="des-label">Designation</InputLabel>
              <Select labelId="des-label" label="Designation" value={designationId} onChange={(e) => setDesignationId(e.target.value)}>
                <MenuItem value="">—</MenuItem>
                {designations.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="manager-label">Manager</InputLabel>
              <Select labelId="manager-label" label="Manager" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <MenuItem value="">—</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<SaveRoundedIcon />}
                onClick={() => setConfirmOpen(true)}
                disabled={!isFormValid}
              >
                Create Employee
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => router.push('/employees')}
              >
                Back to List
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm create</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to create this employee?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirmed} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Confirm'}
          </Button>
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
