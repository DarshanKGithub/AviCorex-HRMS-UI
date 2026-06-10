'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Button, TextField, Grid, Divider, Chip, MenuItem } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  
  
};


type EmployeeOption = {
  id: string;
  full_name: string;
  email: string;
};

type SalaryStructure = {
  employee_id?: string;
  base_salary: number;
  hra: number;
  da: number;
  special_allowance: number;
  pf_percentage: number;
  esi_percentage: number;
  tax_bracket_percentage: number;
};

const defaultSalaryStructure: SalaryStructure = {
  base_salary: 0,
  hra: 0,
  da: 0,
  special_allowance: 0,
  pf_percentage: 12,
  esi_percentage: 0.75,
  tax_bracket_percentage: 0,
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type SalaryFieldKey = keyof Pick<SalaryStructure, 'base_salary' | 'hra' | 'da' | 'special_allowance' | 'pf_percentage' | 'esi_percentage' | 'tax_bracket_percentage'>;

function salaryFieldsToStrings(data: SalaryStructure): Record<SalaryFieldKey, string> {
  return {
    base_salary: data.base_salary === 0 ? '' : String(data.base_salary),
    hra: data.hra === 0 ? '' : String(data.hra),
    da: data.da === 0 ? '' : String(data.da),
    special_allowance: data.special_allowance === 0 ? '' : String(data.special_allowance),
    pf_percentage: String(data.pf_percentage),
    esi_percentage: String(data.esi_percentage),
    tax_bracket_percentage: data.tax_bracket_percentage === 0 ? '' : String(data.tax_bracket_percentage),
  };
}

function stringsToSalaryForm(fields: Record<SalaryFieldKey, string>, employeeId?: string): SalaryStructure {
  return {
    employee_id: employeeId,
    base_salary: fields.base_salary === '' ? 0 : Number(fields.base_salary),
    hra: fields.hra === '' ? 0 : Number(fields.hra),
    da: fields.da === '' ? 0 : Number(fields.da),
    special_allowance: fields.special_allowance === '' ? 0 : Number(fields.special_allowance),
    pf_percentage: fields.pf_percentage === '' ? defaultSalaryStructure.pf_percentage : Number(fields.pf_percentage),
    esi_percentage: fields.esi_percentage === '' ? defaultSalaryStructure.esi_percentage : Number(fields.esi_percentage),
    tax_bracket_percentage: fields.tax_bracket_percentage === '' ? 0 : Number(fields.tax_bracket_percentage),
  };
}

export default function FinancialsPage() {
  const { token, user, status } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingStructure, setSavingStructure] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [salaryForm, setSalaryForm] = useState<SalaryStructure>(defaultSalaryStructure);
  const [salaryFields, setSalaryFields] = useState<Record<SalaryFieldKey, string>>(salaryFieldsToStrings(defaultSalaryStructure));
  const [structureMessage, setStructureMessage] = useState<string | null>(null);
  const [structureError, setStructureError] = useState<string | null>(null);
  
  const canManagePayroll = hasPermission('process_payroll');

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.push('/login');
      return;
    }
    if (token && user) {
      fetchData();
    }
  }, [status, token, user, router]);

  useEffect(() => {
    if (!token || !user) return;
    if (canManagePayroll) {
      fetchEmployees();
    } else {
      setSelectedEmployeeId(user.id);
    }
  }, [token, user, canManagePayroll]);

  useEffect(() => {
    if (!token || !selectedEmployeeId) return;
    fetchSalaryStructure(selectedEmployeeId);
  }, [token, selectedEmployeeId]);

  async function fetchData() {
    setLoading(true);
    try {
      if (!selectedEmployeeId && !canManagePayroll) {
        const res = await fetch(`${API_BASE}/financials/salary-structures/${user?.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const salary = await res.json();
          const normalized = normalizeSalaryStructure(salary);
          setSalaryStructure(normalized);
          setSalaryForm(normalized);
          setSalaryFields(salaryFieldsToStrings(normalized));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function normalizeSalaryStructure(data: any): SalaryStructure {
    return {
      employee_id: data?.employee_id,
      base_salary: toNumber(data?.base_salary),
      hra: toNumber(data?.hra),
      da: toNumber(data?.da),
      special_allowance: toNumber(data?.special_allowance),
      pf_percentage: toNumber(data?.pf_percentage ?? defaultSalaryStructure.pf_percentage),
      esi_percentage: toNumber(data?.esi_percentage ?? defaultSalaryStructure.esi_percentage),
      tax_bracket_percentage: toNumber(data?.tax_bracket_percentage),
    };
  }

  async function fetchEmployees() {
    try {
      const res = await fetch(`${API_BASE}/employees?size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const payload = await res.json();
        const items = (payload.items || []) as EmployeeOption[];
        setEmployees(items);
        if (!selectedEmployeeId && items.length > 0) {
          setSelectedEmployeeId(items[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setStructureError('Failed to load employee list');
    }
  }

  async function fetchSalaryStructure(employeeId: string) {
    setStructureError(null);
    try {
      const res = await fetch(`${API_BASE}/financials/salary-structures/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const normalized = normalizeSalaryStructure(await res.json());
        setSalaryStructure(normalized);
        setSalaryForm(normalized);
        setSalaryFields(salaryFieldsToStrings(normalized));
      } else if (res.status === 404) {
        setSalaryStructure(null);
        setSalaryForm(defaultSalaryStructure);
        setSalaryFields(salaryFieldsToStrings(defaultSalaryStructure));
      } else {
        throw new Error('Failed to load salary structure');
      }
    } catch (e) {
      console.error(e);
      setStructureError('Failed to load salary structure');
    } finally {
      setLoading(false);
    }
  }

  async function saveSalaryStructure() {
    if (!selectedEmployeeId) {
      setStructureError('Select an employee first');
      return;
    }

    setSavingStructure(true);
    setStructureError(null);
    setStructureMessage(null);

    try {
      const normalizedForm = stringsToSalaryForm(salaryFields, selectedEmployeeId);
      setSalaryForm(normalizedForm);
      const payload = {
        employee_id: selectedEmployeeId,
        ...normalizedForm,
      };
      const res = await fetch(`${API_BASE}/financials/salary-structures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.detail || 'Failed to save salary structure');
      }

      const normalized = normalizeSalaryStructure(await res.json());
      setSalaryStructure(normalized);
      setSalaryForm(normalized);
      setSalaryFields(salaryFieldsToStrings(normalized));
      setStructureMessage('Salary structure saved successfully');
    } catch (e) {
      console.error(e);
      setStructureError(e instanceof Error ? e.message : 'Failed to save salary structure');
    } finally {
      setSavingStructure(false);
    }
  }

  const monthlyGross = salaryForm.base_salary + salaryForm.hra + salaryForm.da + salaryForm.special_allowance;
  const pfDeduction = (monthlyGross * salaryForm.pf_percentage) / 100;
  const esiDeduction = (monthlyGross * salaryForm.esi_percentage) / 100;
  const estimatedTax = (monthlyGross * salaryForm.tax_bracket_percentage) / 100;
  const estimatedTakeHome = monthlyGross - pfDeduction - esiDeduction - estimatedTax;
  const annualGross = monthlyGross * 12;
  const selectedEmployee = selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon sx={{ color: '#6366f1' }} /> 
          Compensation & Claims
        </Typography>
      </Stack>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4, color: '#6366f1' }} />
      ) : canManagePayroll ? (
        <Stack spacing={3}>
          {(structureMessage || structureError) && (
            <Alert severity={structureError ? 'error' : 'success'} onClose={() => {
              setStructureError(null);
              setStructureMessage(null);
            }} sx={{ borderRadius: 2 }}>
              {structureError || structureMessage}
            </Alert>
          )}

          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <WorkOutlineIcon sx={{ color: '#6366f1' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Choose Employee
                  </Typography>
                </Stack>
                <TextField
                  select
                  label="Employee"
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                  fullWidth
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.full_name} ({employee.email})
                    </MenuItem>
                  ))}
                </TextField>
                {selectedEmployee && (
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                    Managing compensation for {selectedEmployee.full_name}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={commonCardStyles}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Salary Structure Editor
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                      Update the base package and compliance rates used for payroll processing.
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    startIcon={<SavingsIcon />}
                    onClick={saveSalaryStructure}
                    disabled={savingStructure || !selectedEmployeeId}
                    sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' } }}
                  >
                    {savingStructure ? 'Saving...' : 'Save Structure'}
                  </Button>
                </Stack>

                <Grid container spacing={2.5}>
                  {[
                    { label: 'Base Salary', key: 'base_salary', prefix: '₹' },
                    { label: 'HRA', key: 'hra', prefix: '₹' },
                    { label: 'DA', key: 'da', prefix: '₹' },
                    { label: 'Special Allowance', key: 'special_allowance', prefix: '₹' },
                    { label: 'PF %', key: 'pf_percentage', suffix: '%' },
                    { label: 'ESI %', key: 'esi_percentage', suffix: '%' },
                    { label: 'Tax Bracket %', key: 'tax_bracket_percentage', suffix: '%' },
                  ].map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                      <TextField
                        label={field.label}
                        type="number"
                        value={salaryFields[field.key as SalaryFieldKey]}
                        onChange={(event) => {
                          const key = field.key as SalaryFieldKey;
                          const nextFields = { ...salaryFields, [key]: event.target.value };
                          setSalaryFields(nextFields);
                          setSalaryForm(stringsToSalaryForm(nextFields, selectedEmployeeId));
                        }}
                        fullWidth
                        InputProps={{
                          startAdornment: field.prefix ? <Typography sx={{ mr: 0.5, color: '#94a3b8', fontWeight: 600 }}>{field.prefix}</Typography> : undefined,
                          endAdornment: field.suffix ? <Typography sx={{ ml: 0.5, color: '#94a3b8', fontWeight: 600 }}>{field.suffix}</Typography> : undefined,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <CardContent>
                        <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Monthly Gross</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 1 }}>
                          ₹{monthlyGross.toLocaleString()}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5, fontWeight: 500 }}>Base + allowance components</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#e2e8f0', bgcolor: 'rgba(16, 185, 129, 0.05)' }}>
                      <CardContent>
                        <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Estimated Take Home</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', mt: 1 }}>
                          ₹{estimatedTakeHome.toLocaleString()}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5, fontWeight: 500 }}>After PF, ESI and tax</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#e2e8f0' }}>
                      <CardContent>
                        <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Annual Gross</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 1 }}>
                          ₹{annualGross.toLocaleString()}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5, fontWeight: 500 }}>Projected yearly payroll cost</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Card sx={{ flex: 1, borderRadius: 3, bgcolor: '#f8fafc', border: 'none', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700, mb: 1.5 }}>Compliance Breakdown</Typography>
                      <Stack spacing={1.25}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>PF deduction</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>₹{pfDeduction.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>ESI deduction</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>₹{esiDeduction.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>Estimated tax</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>₹{estimatedTax.toLocaleString()}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={{ flex: 1, borderRadius: 3, bgcolor: '#f8fafc', border: 'none', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700, mb: 1.5 }}>Current Assignment</Typography>
                      <Stack spacing={1.25}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>Employee</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>
                            {selectedEmployee?.full_name || user?.full_name || 'Current user'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>Structure status</Typography>
                          <Typography sx={{ fontWeight: 800, color: salaryStructure ? '#059669' : '#f59e0b' }}>
                            {salaryStructure ? 'Saved' : 'Draft'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontWeight: 600 }}>PF / ESI / Tax</Typography>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>
                            {salaryForm.pf_percentage}% / {salaryForm.esi_percentage}% / {salaryForm.tax_bracket_percentage}%
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Card sx={commonCardStyles}>
          <CardContent sx={{ p: 4 }}>
            {salaryStructure ? (
              <Box>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Chip label="Compensation Structure" sx={{ bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', fontWeight: 800, alignSelf: 'flex-start' }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b' }}>
                    Salary & Tax Details
                  </Typography>
                  <Typography sx={{ color: '#64748b', lineHeight: 1.8, maxWidth: 900, fontWeight: 500 }}>
                    Your assigned compensation bands, statutory deductions, and base salary components.
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  {[
                    { label: 'Base Salary', val: `₹${salaryStructure.base_salary?.toLocaleString()}` },
                    { label: 'HRA', val: `₹${salaryStructure.hra?.toLocaleString()}` },
                    { label: 'DA', val: `₹${salaryStructure.da?.toLocaleString()}` },
                    { label: 'Special Allowance', val: `₹${salaryStructure.special_allowance?.toLocaleString()}` },
                    { label: 'PF Contribution', val: `${salaryStructure.pf_percentage}%` },
                    { label: 'ESI Contribution', val: `${salaryStructure.esi_percentage}%` },
                    { label: 'Tax Bracket', val: `${salaryStructure.tax_bracket_percentage}%` },
                  ].map((item, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                       <Card sx={{ bgcolor: '#f8fafc', border: 'none', boxShadow: 'none', borderRadius: 3 }}>
                         <CardContent>
                            <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>{item.label}</Typography>
                            <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '1.25rem', mt: 0.5 }}>{item.val}</Typography>
                         </CardContent>
                       </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No salary structure defined for your profile yet. Please contact HR.</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
