'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, LinearProgress, Chip, Grid, Tab, Tabs, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TargetIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';
import { usePermissions } from '@/components/auth/usePermissions';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function PerformancePage() {
  const { token, user, status } = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [performanceScore, setPerformanceScore] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_value: 0,
    start_date: '',
    end_date: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

      const [scoreRes, goalsRes, kpisRes, appraisalsRes] = await Promise.all([
        fetch(`${API_BASE}/performance/performance-score/${employeeId}`, { headers }),
        fetch(`${API_BASE}/performance/goals/employee/${employeeId}`, { headers }),
        fetch(`${API_BASE}/performance/kpis/employee/${employeeId}`, { headers }),
        fetch(`${API_BASE}/performance/appraisals/employee/${employeeId}`, { headers }),
      ]);

      if (scoreRes.ok) setPerformanceScore(await scoreRes.json());
      if (goalsRes.ok) setGoals(await goalsRes.json());
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (appraisalsRes.ok) setAppraisals(await appraisalsRes.json());
    } catch (e: any) {
      setError('Failed to load performance data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createGoal() {
    if (!goalForm.title || !goalForm.target_value || !goalForm.start_date || !goalForm.end_date) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/performance/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...goalForm,
          employee_id: employeeId,
          target_value: parseFloat(goalForm.target_value as any),
          status: 'Active',
        }),
      });

      if (res.ok) {
        setMessage('Goal created successfully');
        setOpenGoalDialog(false);
        setGoalForm({ title: '', description: '', target_value: 0, start_date: '', end_date: '' });
        fetchData();
      } else {
        setError('Failed to create goal');
      }
    } catch (e) {
      setError('Network error');
    }
  }

  const activeGoals = goals.filter(g => g.status === 'Active');
  const activeKpis = kpis.filter(k => k.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');
  const recentAppraisals = appraisals.slice(0, 3);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          Performance & KPI Management
        </Typography>
        {canManagePerformance && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenGoalDialog(true)}
            sx={{ bgcolor: '#6d28d9', textTransform: 'none' }}
          >
            Set Goal
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>{message}</Alert>}

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Performance Score</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {performanceScore?.score?.toFixed(1) || '0'}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={performanceScore?.score || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#6d28d9' },
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Based on {performanceScore?.kpi_count || 0} KPIs
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Active Goals</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {activeGoals.length}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {completedGoals.length} completed this period
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Active KPIs</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {activeKpis.length}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Being tracked
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>Appraisals</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appraisals.length}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Total appraisals on record
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for Goals, KPIs, and Appraisals */}
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Tab label="Active Goals" icon={<TargetIcon fontSize="small" />} iconPosition="start" />
            <Tab label="KPI Tracking" icon={<TrendingUpIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Appraisals" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
          </Tabs>

          {/* Goals Tab */}
          {activeTab === 0 && (
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', py: 3 }}>No active goals. Create one to get started.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {activeGoals.map((goal) => (
                      <Card key={goal.id} variant="outlined" sx={{ borderRadius: 2, borderColor: '#e5e7eb' }}>
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                  {goal.title}
                                </Typography>
                                {goal.description && (
                                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5 }}>
                                    {goal.description}
                                  </Typography>
                                )}
                              </Box>
                              <Chip
                                label={goal.status}
                                sx={{
                                  bgcolor: goal.status === 'Active' ? '#dcfce7' : '#fef3c7',
                                  color: goal.status === 'Active' ? '#15803d' : '#92400e',
                                }}
                              />
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ fontSize: '0.875rem' }}>
                              <Typography><strong>Target:</strong> {goal.target_value}</Typography>
                              <Typography><strong>Achieved:</strong> {goal.achieved_value || 0}</Typography>
                              <Typography><strong>Progress:</strong> {goal.achievement_percentage?.toFixed(1)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={goal.achievement_percentage || 0}
                              sx={{
                                height: 8,
                                borderRadius: 2,
                                backgroundColor: '#e5e7eb',
                                '& .MuiLinearProgress-bar': { backgroundColor: '#6d28d9' },
                              }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          {/* KPI Tracking Tab */}
          {activeTab === 1 && (
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                {activeKpis.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', py: 3 }}>No active KPIs set yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {activeKpis.map((kpi) => {
                      const achievement = kpi.target_value > 0 ? ((kpi.achieved_value || 0) / kpi.target_value) * 100 : 0;
                      return (
                        <Card key={kpi.id} variant="outlined" sx={{ borderRadius: 2, borderColor: '#e5e7eb' }}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {kpi.title}
                                  </Typography>
                                  {kpi.description && (
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5 }}>
                                      {kpi.description}
                                    </Typography>
                                  )}
                                </Box>
                                <Chip label={`${kpi.weightage}% weight`} variant="outlined" />
                              </Box>
                              <Stack direction="row" spacing={2} sx={{ fontSize: '0.875rem' }}>
                                <Typography><strong>Target:</strong> {kpi.target_value}</Typography>
                                <Typography><strong>Achieved:</strong> {kpi.achieved_value || 0}</Typography>
                                <Typography><strong>Progress:</strong> {achievement.toFixed(1)}%</Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(achievement, 100)}
                                sx={{
                                  height: 8,
                                  borderRadius: 2,
                                  backgroundColor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: achievement >= 100 ? '#16a34a' : '#6d28d9',
                                  },
                                }}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          {/* Appraisals Tab */}
          {activeTab === 2 && (
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                {recentAppraisals.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', py: 3 }}>No performance appraisals yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {recentAppraisals.map((appraisal) => (
                      <Card key={appraisal.id} variant="outlined" sx={{ borderRadius: 2, borderColor: '#e5e7eb' }}>
                        <CardContent>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {appraisal.review_period}
                              </Typography>
                              <Chip label={appraisal.status} />
                            </Box>
                            {appraisal.rating && (
                              <Typography sx={{ color: 'text.secondary' }}>
                                <strong>Rating:</strong> {appraisal.rating}/5.0
                              </Typography>
                            )}
                            {appraisal.comments && (
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                {appraisal.comments}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set New Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Goal Title"
              fullWidth
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g., Increase sales by 20%"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              placeholder="Add details about this goal"
            />
            <TextField
              label="Target Value"
              type="number"
              fullWidth
              value={goalForm.target_value}
              onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value as any })}
              placeholder="e.g., 100"
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={goalForm.start_date}
              onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={goalForm.end_date}
              onChange={(e) => setGoalForm({ ...goalForm, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenGoalDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createGoal} sx={{ bgcolor: '#6d28d9' }}>
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
