'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function FinancialsPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<any | null>(null);
  
  const [openReimModal, setOpenReimModal] = useState(false);
  const [reimForm, setReimForm] = useState({ expense_type: 'Travel', amount: 0, description: '' });

  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ loan_type: 'Personal', amount: 0, interest_rate: 0, emi_amount: 0, remaining_balance: 0 });

  useEffect(() => {
    if (token && user) {
      fetchData();
    }
  }, [token, user]);

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
      if (salaryRes.ok) setSalaryStructure(await salaryRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Base Salary:</Typography><Typography fontWeight={600}>₹{salaryStructure.base_salary}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>HRA:</Typography><Typography fontWeight={600}>₹{salaryStructure.hra}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>DA:</Typography><Typography fontWeight={600}>₹{salaryStructure.da}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Special Allowance:</Typography><Typography fontWeight={600}>₹{salaryStructure.special_allowance}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>PF Contribution:</Typography><Typography fontWeight={600}>{salaryStructure.pf_percentage}%</Typography></Box>
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
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenReimModal(true)} sx={{ mb: 2, bgcolor: '#3b82f6', textTransform: 'none' }}>Claim Reimbursement</Button>
          <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Applied On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reimbursements.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#6b7280' }}>No claims found.</TableCell></TableRow>
                ) : (
                  reimbursements.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.expense_type}</TableCell>
                      <TableCell>₹{r.amount}</TableCell>
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
