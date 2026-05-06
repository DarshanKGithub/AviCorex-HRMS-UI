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
import PaymentIcon from '@mui/icons-material/Payment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../../components/auth/AuthContext';
import { usePermissions } from '../../components/auth/usePermissions';
import { useRouter } from 'next/navigation';

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
        return '#3b82f6';
      case 'draft':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Box className="mx-auto max-w-6xl px-4 py-6">
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Chip label="Compensation" sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c' }}>
            Payroll & Compensation
          </Typography>
          <Typography sx={{ mt: 1, color: '#5b5f7a', lineHeight: 1.8 }}>
            View your salary structure and payslips
          </Typography>
        </Box>

        {/* Alerts */}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
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
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c' }}>
                        Current Salary Structure
                      </Typography>
                    </Stack>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                            Base Salary
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15162c' }}>
                            {salary.currency} {salary.base_salary.toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mt: 0.5 }}>
                            Monthly
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                            Grade
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15162c' }}>
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
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#15162c', mb: 2 }}>
                Your Payslips
              </Typography>
              {payslips.length > 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb', borderBottom: '2px solid #e7e9ef' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2, textAlign: 'right' }}>Gross Salary</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2, textAlign: 'right' }}>Deductions</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2, textAlign: 'right' }}>Net Salary</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c', py: 2 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payslips.map((p) => (
                        <TableRow key={p.id} sx={{ borderBottom: '1px solid #e7e9ef', '&:hover': { bgcolor: '#f9fafb' } }}>
                          <TableCell sx={{ color: '#15162c', fontWeight: 500, py: 2 }}>
                            {monthNames[p.month - 1]} {p.year}
                          </TableCell>
                          <TableCell sx={{ color: '#15162c', fontWeight: 600, textAlign: 'right', py: 2 }}>
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
                                  color: '#6b7280',
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
                                    color: '#6b7280',
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
                    <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>No payslips available yet</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </>
        )}

        {/* Payslip Detail Dialog */}
        <Dialog open={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#15162c', pb: 1 }}>
            {selectedPayslip && `Payslip - ${monthNames[selectedPayslip.month - 1]} ${selectedPayslip.year}`}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedPayslip && (
              <Stack spacing={3}>
                {/* Summary Section */}
                <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                        Gross Salary
                      </Typography>
                      <Typography sx={{ color: '#15162c', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.gross_salary.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                        Deductions
                      </Typography>
                      <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.total_deductions.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                        Tax
                      </Typography>
                      <Typography sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem', mt: 0.5 }}>
                        ₹{selectedPayslip.total_tax.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
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
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                        Days Worked
                      </Typography>
                      <Typography sx={{ color: '#15162c', fontWeight: 700, mt: 0.5 }}>
                        {selectedPayslip.days_worked}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ color: '#5b5f7a', fontSize: '0.875rem', fontWeight: 600 }}>
                        Days Absent
                      </Typography>
                      <Typography sx={{ color: '#15162c', fontWeight: 700, mt: 0.5 }}>
                        {selectedPayslip.days_absent}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Components Breakdown */}
                <Box>
                  <Typography sx={{ color: '#15162c', fontWeight: 700, mb: 2 }}>
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
                            <Typography sx={{ color: '#15162c', fontWeight: 500, fontSize: '0.9rem' }}>
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
