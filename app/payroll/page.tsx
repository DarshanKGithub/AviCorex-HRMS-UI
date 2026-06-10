'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import PaymentIcon from '@mui/icons-material/Payment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { useAuth } from '../../components/auth/AuthContext';
import { usePermissions } from '../../components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Salary = {
  id: string;
  employee_id: string;
  base_salary: number;
  grade?: string;
  currency: string;
};

type PayslipComponent = {
  id: string;
  component_name: string;
  component_type: string;
  amount: number;
};

type Payslip = {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  base_salary: number;
  gross_salary: number;
  total_deductions: number;
  total_tax: number;
  net_salary: number;
  days_worked: number;
  days_absent: number;
  status: string;
};

type PayslipDetail = Payslip & {
  components: PayslipComponent[];
};

export default function PayrollPage() {
  const auth = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [salary, setSalary] = useState<Salary | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canProcessPayroll = hasPermission('process_payroll');
  const payrollHighlights = [
    { label: 'Payroll cycle', value: 'Monthly', accent: '#7C3AED' },
    { label: 'Payslips', value: `${payslips.length}`, accent: '#10b981' },
    { label: 'Status', value: loading ? 'Syncing' : 'Ready', accent: '#8b5cf6' },
  ];

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchSalary();
      fetchPayslips();
    }
  }, [auth.status, auth.token, router]);

  async function fetchSalary() {
    try {
      const res = await fetch(`${API_BASE}/payroll/salary`, {
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setSalary(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load salary information');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPayslips() {
    try {
      const url = new URL(`${API_BASE}/payroll/payslips`);
      url.searchParams.set('size', '50');
      const res = await fetch(url.toString(), {
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        const payload = await res.json();
        setPayslips(payload.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function viewPayslipDetails(payslipId: string) {
    try {
      const res = await fetch(`${API_BASE}/payroll/payslips/${payslipId}`, {
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPayslip(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load payslip details');
    }
  }

  async function downloadPayslipPDF(payslipId: string) {
    try {
      const res = await fetch(`${API_BASE}/payroll/payslips/${payslipId}/pdf`, {
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${payslips.find(p => p.id === payslipId)?.month || 'unknown'}_${payslips.find(p => p.id === payslipId)?.year || 'unknown'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Payslip downloaded successfully');
      } else {
        setError('Failed to download payslip');
      }
    } catch (err) {
      console.error(err);
      setError('Error downloading payslip');
    }
  }

  async function sendPayslipEmail(payslipId: string) {
    if (!canProcessPayroll) {
      setError('You do not have permission to email payslips');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/payroll/payslips/${payslipId}/send-email`, {
        method: 'POST',
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : '' },
      });
      if (res.ok) {
        setSuccess('Payslip sent via email successfully');
      } else {
        setError('Failed to send payslip via email');
      }
    } catch (err) {
      console.error(err);
      setError('Error sending payslip email');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'approved':
        return '#7C3AED';
      case 'draft':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Box className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumbs />
      <Stack spacing={4}>
        <Card sx={{ borderRadius: 5, overflow: 'hidden', bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px -24px rgba(15,23,42,0.45)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 24%), radial-gradient(circle at bottom left, rgba(139,92,246,0.12), transparent 28%)' }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
              <Box sx={{ maxWidth: 700 }}>
                <Chip label="Compensation Command Center" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }} />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                  Payroll & Compensation, presented like a premium SaaS workspace.
                </Typography>
                <Typography sx={{ mt: 1, color: 'rgba(226,232,240,0.78)', maxWidth: 620 }}>
                  See salary structure, download payslips, and keep finance workflows calm, precise, and easy to scan.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: '#c4b5fd !important' }} />} label="Live summaries" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Chip icon={<InsightsRoundedIcon sx={{ color: '#86efac !important' }} />} label="AI-ready insights" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          {payrollHighlights.map((item) => (
            <Grid item xs={12} sm={4} key={item.label}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>{item.label}</Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, color: item.accent }}>{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Alerts */}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={64} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
          </Box>
        ) : (
          <>
            {/* Salary Summary */}
            {salary && (
              <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <PaymentIcon sx={{ fontSize: 28, color: '#4f4b9c' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Current Salary Structure
                      </Typography>
                    </Stack>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                            Base Salary
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {salary.currency} {salary.base_salary.toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mt: 0.5 }}>
                            Monthly
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                            Grade
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {salary.grade || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Payslips Table */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Your Payslips
              </Typography>
              {payslips.length > 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb', borderBottom: '2px solid #e7e9ef' }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2, textAlign: 'right' }}>Gross Salary</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2, textAlign: 'right' }}>Deductions</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2, textAlign: 'right' }}>Net Salary</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payslips.map((p) => (
                        <TableRow key={p.id} sx={{ borderBottom: '1px solid #e7e9ef', '&:hover': { bgcolor: '#f9fafb' } }}>
                          <TableCell sx={{ color: 'text.primary', fontWeight: 500, py: 2 }}>
                            {monthNames[p.month - 1]} {p.year}
                          </TableCell>
                          <TableCell sx={{ color: 'text.primary', fontWeight: 600, textAlign: 'right', py: 2 }}>
                            ₹{p.gross_salary.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#ef4444', fontWeight: 500, textAlign: 'right', py: 2 }}>
                            ₹{p.total_deductions.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#10b981', fontWeight: 700, textAlign: 'right', py: 2 }}>
                            ₹{p.net_salary.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                              sx={{
                                bgcolor: `${getStatusColor(p.status)}15`,
                                color: getStatusColor(p.status),
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => viewPayslipDetails(p.id)}
                                sx={{
                                  color: '#4f4b9c',
                                  borderColor: '#4f4b9c',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  fontSize: '0.8rem',
                                  py: 0.5,
                                  px: 1.5,
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#f3f0ff', borderColor: '#4f4b9c' },
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => downloadPayslipPDF(p.id)}
                                sx={{
                                  color: 'text.secondary',
                                  borderColor: '#d1d5db',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  fontSize: '0.8rem',
                                  py: 0.5,
                                  px: 1.5,
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#f3f4f6' },
                                }}
                              >
                                <FileDownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                PDF
                              </Button>
                              {canProcessPayroll && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => sendPayslipEmail(p.id)}
                                  sx={{
                                    color: 'text.secondary',
                                    borderColor: '#d1d5db',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    py: 0.5,
                                    px: 1.5,
                                    borderRadius: 1.5,
                                    '&:hover': { bgcolor: '#f3f4f6' },
                                  }}
                                >
                                  📧 Email
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
                  <CardContent sx={{ py: 4, textAlign: 'center' }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography sx={{ color: 'text.primary', fontWeight: 800, mb: 0.5 }}>No payslips available yet</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Once payroll is processed, your latest slips will appear here.</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </>
        )}

        {/* Payslip Detail Dialog */}
        <Dialog open={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', pb: 1 }}>
            {selectedPayslip && `Payslip - ${monthNames[selectedPayslip.month - 1]} ${selectedPayslip.year}`}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedPayslip && (
              <Stack spacing={3}>
                {/* Summary Section */}
                <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Gross Salary
                      </Typography>
                      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.gross_salary.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Deductions
                      </Typography>
                      <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.total_deductions.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Tax
                      </Typography>
                      <Typography sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.total_tax.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Net Salary
                      </Typography>
                      <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.net_salary.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Attendance */}
                <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Days Worked
                      </Typography>
                      <Typography sx={{ color: 'text.primary', fontWeight: 700, mt: 0.5 }}>
                        {selectedPayslip.days_worked}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                        Days Absent
                      </Typography>
                      <Typography sx={{ color: 'text.primary', fontWeight: 700, mt: 0.5 }}>
                        {selectedPayslip.days_absent}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Components Breakdown */}
                <Box>
                  <Typography sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
                    Components Breakdown
                  </Typography>
                  {selectedPayslip.components && selectedPayslip.components.length > 0 ? (
                    <Stack spacing={1}>
                      {selectedPayslip.components.map((comp) => (
                        <Box
                          key={comp.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 1.5,
                            bgcolor: '#f9fafb',
                            borderRadius: 1,
                          }}
                        >
                          <Stack>
                            <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.9rem' }}>
                              {comp.component_name}
                            </Typography>
                            <Chip
                              label={comp.component_type}
                              size="small"
                              sx={{
                                width: 'fit-content',
                                mt: 0.5,
                                bgcolor:
                                  comp.component_type === 'earning'
                                    ? '#dcfce7'
                                    : comp.component_type === 'deduction'
                                      ? '#fee2e2'
                                      : '#fef3c7',
                                color:
                                  comp.component_type === 'earning'
                                    ? '#166534'
                                    : comp.component_type === 'deduction'
                                      ? '#991b1b'
                                      : '#92400e',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                          </Stack>
                          <Typography
                            sx={{
                              color:
                                comp.component_type === 'earning'
                                  ? '#10b981'
                                  : comp.component_type === 'deduction'
                                    ? '#ef4444'
                                    : '#f59e0b',
                              fontWeight: 700,
                            }}
                          >
                            ₹{comp.amount.toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      No component details available
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e7e9ef' }}>
            <Button onClick={() => setSelectedPayslip(null)}>Close</Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#4f4b9c',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#3f3a7c' },
              }}
            >
              <FileDownloadIcon sx={{ mr: 1 }} />
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
