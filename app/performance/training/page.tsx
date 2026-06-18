'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE = getApiBaseUrl();

export default function TrainingCertificationPage() {
  const { token, user, status } = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [openCertDialog, setOpenCertDialog] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const canManagePerformance = hasPermission('manage_performance');

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.push('/login');
      return;
    }
    if (token && user) {
      fetchData();
    }
  }, [status, token, user, router]);

  async function fetchData() {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [trainingsRes, certsRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE}/performance/training/enrollments/employee/${employeeId}`, { headers }),
        fetch(`${API_BASE}/performance/certifications/employee/${employeeId}`, { headers }),
        fetch(`${API_BASE}/performance/training/courses`, { headers }),
      ]);

      if (trainingsRes.ok) setTrainings(await trainingsRes.json());
      if (certsRes.ok) setCertifications(await certsRes.json());
      if (coursesRes.ok) setAllCourses(await coursesRes.json());
    } catch (e: any) {
      setError('Failed to load training data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addCertification() {
    if (!certForm.name || !certForm.issuing_authority || !certForm.issue_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/performance/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...certForm,
          employee_id: employeeId,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setMessage(`Certification added. Verification ID: ${created.verification_id || 'N/A'}`);
        setOpenCertDialog(false);
        setCertForm({ name: '', issuing_authority: '', issue_date: '', expiry_date: '' });
        fetchData();
      } else {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Failed to add certification');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  async function verifyCertification() {
    if (!verifyId.trim()) {
      setError('Enter a verification ID');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/performance/certifications/verify/${encodeURIComponent(verifyId.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setVerifyResult(await res.json());
        setError('');
      } else {
        setVerifyResult(null);
        setError('Certification not found for this verification ID');
      }
    } catch {
      setError('Network error while verifying certification');
    }
  }

  async function deleteCertification(certId: string) {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      const res = await fetch(`${API_BASE}/performance/certifications/${certId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('Certification deleted');
        fetchData();
      } else {
        setError('Failed to delete certification');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  const completedTrainings = trainings.filter(t => t.status === 'Completed');
  const enrolledTrainings = trainings.filter(t => t.status === 'Enrolled' || t.status === 'In Progress');
  const expiredCerts = certifications.filter(c => c.expiry_date && new Date(c.expiry_date) < new Date());
  const activeCerts = certifications.filter(c => !c.expiry_date || new Date(c.expiry_date) >= new Date());

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" />
          Training & Certifications
        </Typography>
        {(canManagePerformance || true) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCertDialog(true)}
            sx={{ bgcolor: '#6d28d9', textTransform: 'none' }}
          >
            Add Certification
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>{message}</Alert>}

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
            <Card sx={{ borderRadius: 1, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Enrolled Trainings</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 1 }}>
                  {enrolledTrainings.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 1, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Completed</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 1 }}>
                  {completedTrainings.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 1, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Active Certs</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 1 }}>
                  {activeCerts.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 1, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Expired Certs</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: expiredCerts.length > 0 ? '#dc2626' : '#15162c', mt: 1 }}>
                  {expiredCerts.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Tab label="Training Enrollments" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Certifications" icon={<SchoolIcon fontSize="small" />} iconPosition="start" />
          </Tabs>

          {/* Training Enrollments Tab */}
          {activeTab === 0 && (
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Enrolled On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No training enrollments yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainings.map(t => {
                      const course = allCourses.find(c => c.id === t.course_id);
                      return (
                        <TableRow key={t.id}>
                          <TableCell>{course?.title || 'Unknown Course'}</TableCell>
                          <TableCell>{course?.instructor || '-'}</TableCell>
                          <TableCell>{course?.duration_hours ? `${course.duration_hours} hrs` : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={t.status}
                              sx={{
                                bgcolor: t.status === 'Completed' ? '#dcfce7' : t.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                                color: t.status === 'Completed' ? '#15803d' : t.status === 'In Progress' ? '#0c4a6e' : '#92400e',
                              }}
                            />
                          </TableCell>
                          <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Certifications Tab */}
          {activeTab === 1 && (
            <>
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3, p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <TextField
                  label="Verify by ID"
                  placeholder="e.g. CERT-A1B2C3D4"
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value.toUpperCase())}
                  fullWidth
                />
                <Button variant="contained" onClick={verifyCertification} sx={{ bgcolor: '#6d28d9', textTransform: 'none', whiteSpace: 'nowrap' }}>
                  Verify Certificate
                </Button>
              </Stack>
              {verifyResult && (
                <Alert severity={verifyResult.is_valid ? 'success' : 'warning'} sx={{ mt: 2 }}>
                  {verifyResult.name} — {verifyResult.issuing_authority}. Status: {verifyResult.is_valid ? 'Valid' : 'Expired'}.
                </Alert>
              )}
            </Card>
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Verification ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Certification</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issued By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No certifications added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    certifications.map(c => {
                      const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                      return (
                        <TableRow key={c.id}>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#6d28d9' }}>{c.verification_id || '—'}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                          <TableCell>{c.issuing_authority}</TableCell>
                          <TableCell>{new Date(c.issue_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'No expiry'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isExpired ? 'Expired' : 'Active'}
                              sx={{
                                bgcolor: isExpired ? '#fee2e2' : '#dcfce7',
                                color: isExpired ? '#991b1b' : '#15803d',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => deleteCertification(c.id)}
                              sx={{ color: '#ef4444', textTransform: 'none' }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
            </>
          )}
        </>
      )}

      {/* Add Certification Dialog */}
      <Dialog open={openCertDialog} onClose={() => setOpenCertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Certification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Certification Name"
              fullWidth
              value={certForm.name}
              onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
              placeholder="e.g., AWS Solutions Architect"
            />
            <TextField
              label="Issuing Authority"
              fullWidth
              value={certForm.issuing_authority}
              onChange={(e) => setCertForm({ ...certForm, issuing_authority: e.target.value })}
              placeholder="e.g., Amazon Web Services"
            />
            <TextField
              label="Issue Date"
              type="date"
              fullWidth
              value={certForm.issue_date}
              onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expiry Date (Optional)"
              type="date"
              fullWidth
              value={certForm.expiry_date}
              onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCertDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addCertification} sx={{ bgcolor: '#6d28d9' }}>
            Add Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
