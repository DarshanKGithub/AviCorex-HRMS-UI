'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Divider, Chip, MenuItem } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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

export default function FinancialsPage() {
  const { token, user, status } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingStructure, setSavingStructure] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [salaryForm, setSalaryForm] = useState<SalaryStructure>(defaultSalaryStructure);
  const [structureMessage, setStructureMessage] = useState<string | null>(null);
  const [structureError, setStructureError] = useState<string | null>(null);
  
  const [openReimModal, setOpenReimModal] = useState(false);
  const [reimForm, setReimForm] = useState({ expense_type: 'Travel', amount: 0, description: '' });

  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ loan_type: 'Personal', amount: 0, interest_rate: 0, emi_amount: 0, remaining_balance: 0 });
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
    if (!token || !user) {
      return;
    }

    if (canManagePayroll) {
      fetchEmployees();
    } else {
      setSelectedEmployeeId(user.id);
    }
  }, [token, user, canManagePayroll]);

  useEffect(() => {
    if (!token || !selectedEmployeeId) {
      return;
    }

    fetchSalaryStructure(selectedEmployeeId);
  }, [token, selectedEmployeeId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [reimRes, loanRes, salaryRes] = await Promise.all([
        fetch(`${API_BASE}/financials/reimbursements`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/financials/loans`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/financials/salary-structures/${user?.id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (reimRes.ok) setReimbursements(await reimRes.json());
      if (loanRes.ok) setLoans(await loanRes.json());
      if (salaryRes.ok && !selectedEmployeeId && !canManagePayroll) {
        const salary = await salaryRes.json();
        const normalized = normalizeSalaryStructure(salary);
        setSalaryStructure(normalized);
        setSalaryForm(normalized);
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
      } else if (res.status === 404) {
        setSalaryStructure(null);
        setSalaryForm(defaultSalaryStructure);
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
      const payload = {
        employee_id: selectedEmployeeId,
        ...salaryForm,
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
      setStructureMessage('Salary structure saved successfully');
    } catch (e) {
      console.error(e);
      setStructureError(e instanceof Error ? e.message : 'Failed to save salary structure');
    } finally {
      setSavingStructure(false);
    }
  }

  async function applyReimbursement() {
    try {
      const res = await fetch(`${API_BASE}/financials/reimbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reimForm)
      });
      if (res.ok) {
        setOpenReimModal(false);
    const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);
    const activeStructure = salaryStructure ?? salaryForm;
    const monthlyGross = activeStructure.base_salary + activeStructure.hra + activeStructure.da + activeStructure.special_allowance;
    const pfDeduction = activeStructure.base_salary * (activeStructure.pf_percentage / 100);
    const esiDeduction = monthlyGross * (activeStructure.esi_percentage / 100);
    const estimatedTax = monthlyGross * (activeStructure.tax_bracket_percentage / 100);
    const estimatedTakeHome = Math.max(monthlyGross - pfDeduction - esiDeduction - estimatedTax, 0);
    const annualGross = monthlyGross * 12;

        fetchData();
      } else {
        alert('Failed to submit reimbursement');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  async function applyLoan() {
    try {
      const form = { ...loanForm, remaining_balance: loanForm.amount };
      const res = await fetch(`${API_BASE}/financials/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setOpenLoanModal(false);
        fetchData();
      } else {
        alert('Failed to submit loan application');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" /> 
          Financials & Compensation
        </Typography>
      </Stack>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Tab label="Salary Structure & Tax" icon={<AccountBalanceWalletIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Reimbursements" icon={<ReceiptIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Loans & Advances" icon={<CreditCardIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : activeTab === 0 ? (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <CardContent>
            {salaryStructure ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Current Salary Structure</Typography>
                <Stack spacing={1.5} sx={{ mb: 4 }}>
                  <Chip label="Compensation" sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontWeight: 700, alignSelf: 'flex-start' }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c' }}>
                    Salary Structure, Tax, PF & ESI
                  </Typography>
                  <Typography sx={{ color: '#5b5f7a', lineHeight: 1.8, maxWidth: 900 }}>
                    Configure compensation bands, statutory deductions, and salary components from one place.
                  </Typography>
                </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ESI Contribution:</Typography><Typography fontWeight={600}>{salaryStructure.esi_percentage}%</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Tax Bracket:</Typography><Typography fontWeight={600}>{salaryStructure.tax_bracket_percentage}%</Typography></Box>
                </Stack>
              </Box>
            ) : (
              <Alert severity="info">No salary structure defined for your profile yet.</Alert>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 1 ? (
                  <Stack spacing={3}>
                    {(structureMessage || structureError) && (
                      <Alert severity={structureError ? 'error' : 'success'} onClose={() => {
                        setStructureError(null);
                        setStructureMessage(null);
                      }}>
                        {structureError || structureMessage}
                      </Alert>
                    )}

                    {canManagePayroll && (
                      <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <WorkOutlineIcon sx={{ color: '#2563eb' }} />
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c' }}>
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
                              <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Managing compensation for {selectedEmployee.full_name}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Stack spacing={3}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Stack spacing={0.5}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c' }}>
                                Salary Structure Editor
                              </Typography>
                              <Typography sx={{ color: '#5b5f7a', fontSize: '0.95rem' }}>
                                Update the base package and compliance rates used for payroll processing.
                              </Typography>
                            </Stack>
                            {canManagePayroll && (
                              <Button
                                variant="contained"
                                startIcon={<SavingsIcon />}
                                onClick={saveSalaryStructure}
                                disabled={savingStructure || !selectedEmployeeId}
                                sx={{ bgcolor: '#2563eb', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                              >
                                {savingStructure ? 'Saving...' : 'Save Structure'}
                              </Button>
                            )}
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
                                  value={salaryForm[field.key as keyof SalaryStructure]}
                                  onChange={(event) =>
                                    setSalaryForm((current) => ({
                                      ...current,
                                      [field.key]: Number(event.target.value) || 0,
                                    }))
                                  }
                                  fullWidth
                                  disabled={!canManagePayroll}
                                  InputProps={{
                                    startAdornment: field.prefix ? <Typography sx={{ mr: 0.5, color: '#6b7280' }}>{field.prefix}</Typography> : undefined,
                                    endAdornment: field.suffix ? <Typography sx={{ ml: 0.5, color: '#6b7280' }}>{field.suffix}</Typography> : undefined,
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>

                          <Divider />

                          <Grid container spacing={2.5}>
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#dbe4f0' }}>
                                <CardContent>
                                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Monthly Gross</Typography>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#15162c', mt: 1 }}>
                                    ₹{monthlyGross.toLocaleString()}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5 }}>Base + allowance components</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#dbe4f0' }}>
                                <CardContent>
                                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Estimated Take Home</Typography>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 1 }}>
                                    ₹{estimatedTakeHome.toLocaleString()}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5 }}>After PF, ESI and tax</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: '#dbe4f0' }}>
                                <CardContent>
                                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Annual Gross</Typography>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                                    ₹{annualGross.toLocaleString()}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5 }}>Projected yearly payroll cost</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <Card sx={{ flex: 1, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                              <CardContent>
                                <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 700, mb: 1 }}>Compliance Breakdown</Typography>
                                <Stack spacing={1.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>PF deduction</Typography>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>₹{pfDeduction.toLocaleString()}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>ESI deduction</Typography>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>₹{esiDeduction.toLocaleString()}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>Estimated tax</Typography>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>₹{estimatedTax.toLocaleString()}</Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                              <CardContent>
                                <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 700, mb: 1 }}>Current Assignment</Typography>
                                <Stack spacing={1.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>Employee</Typography>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                                      {selectedEmployee?.full_name || user?.full_name || 'Current user'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>Structure status</Typography>
                                    <Typography sx={{ fontWeight: 700, color: salaryStructure ? '#16a34a' : '#f59e0b' }}>
                                      {salaryStructure ? 'Saved' : 'Draft'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Typography sx={{ color: '#334155' }}>PF / ESI / Tax</Typography>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                                      {salaryForm.pf_percentage}% / {salaryForm.esi_percentage}% / {salaryForm.tax_bracket_percentage}%
                                    </Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Stack>

                          {!canManagePayroll && (
                            <Alert severity="info">This view is read-only for your role. HR and Admin can update salary structures and compliance rates.</Alert>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{new Date(r.applied_on).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </Box>
      ) : (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenLoanModal(true)} sx={{ mb: 2, bgcolor: '#3b82f6', textTransform: 'none' }}>Apply for Loan/Advance</Button>
          <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Loan Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>EMI</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remaining Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6b7280' }}>No active loans.</TableCell></TableRow>
                ) : (
                  loans.map(l => (
                    <TableRow key={l.id}>
                      <TableCell>{l.loan_type}</TableCell>
                      <TableCell>₹{l.amount}</TableCell>
                      <TableCell>₹{l.emi_amount}</TableCell>
                      <TableCell>₹{l.remaining_balance}</TableCell>
                      <TableCell>{l.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </Box>
      )}

      {/* Reimbursement Modal */}
      <Dialog open={openReimModal} onClose={() => setOpenReimModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Claim Reimbursement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Expense Type" fullWidth value={reimForm.expense_type} onChange={e => setReimForm({...reimForm, expense_type: e.target.value})} />
            <TextField label="Amount (₹)" type="number" fullWidth value={reimForm.amount} onChange={e => setReimForm({...reimForm, amount: parseFloat(e.target.value) || 0})} />
            <TextField label="Description" fullWidth multiline rows={3} value={reimForm.description} onChange={e => setReimForm({...reimForm, description: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReimModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={applyReimbursement} sx={{ bgcolor: '#3b82f6' }}>Submit Claim</Button>
        </DialogActions>
      </Dialog>

      {/* Loan Modal */}
      <Dialog open={openLoanModal} onClose={() => setOpenLoanModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Loan</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Loan Type" fullWidth value={loanForm.loan_type} onChange={e => setLoanForm({...loanForm, loan_type: e.target.value})} placeholder="e.g. Personal, Salary Advance" />
            <TextField label="Amount (₹)" type="number" fullWidth value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: parseFloat(e.target.value) || 0})} />
            <TextField label="EMI Amount (₹)" type="number" fullWidth value={loanForm.emi_amount} onChange={e => setLoanForm({...loanForm, emi_amount: parseFloat(e.target.value) || 0})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenLoanModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={applyLoan} sx={{ bgcolor: '#3b82f6' }}>Submit Application</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
