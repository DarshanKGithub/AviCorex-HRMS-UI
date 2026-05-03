"use client";

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type DepartmentOption = {
  id: string;
  name: string;
};

type DashboardSummary = {
  generated_at: string;
  filters: {
    start_date: string | null;
    end_date: string | null;
    department_id: string | null;
  };
  kpis: {
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
    departments_count: number;
    pending_approvals: number;
  };
  attendance_summary: {
    status: string;
    present: number;
    absent: number;
    late: number;
  };
  department_breakdown: Array<{
    department_id: string | null;
    department_name: string;
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
  }>;
};

function toCsvRow(values: Array<string | number>) {
  return values
    .map((value) => {
      const cell = String(value ?? '');
      const escaped = cell.replace(/"/g, '""');
      return `"${escaped}"`;
    })
    .join(',');
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const lines = [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))].join('\n');
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const role = auth.user?.role ?? 'Employee';

  const roleWidgets = useMemo(() => {
    if (role === 'Admin') {
      return ['Global headcount health', 'Approval queue overview', 'Department distribution'];
    }
    if (role === 'HR') {
      return ['Hiring and exits snapshot', 'People operations queue', 'Department distribution'];
    }
    if (role === 'Manager') {
      return ['Team capacity snapshot', 'Pending team actions', 'Department context'];
    }
    if (role === 'CEO') {
      return ['Organization pulse', 'Leadership KPIs', 'Department footprint'];
    }
    return ['Workforce snapshot'];
  }, [role]);

  async function fetchDepartments() {
    try {
      const res = await fetch(`${API_BASE_URL}/org/departments`);
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as DepartmentOption[];
      setDepartments(data);
    } catch {
      // Keep dashboard usable even when lookup fails.
    }
  }

  async function fetchSummary(nextFilters?: { startDate?: string; endDate?: string; departmentId?: string }) {
    if (!auth.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    const usedStart = nextFilters?.startDate ?? startDate;
    const usedEnd = nextFilters?.endDate ?? endDate;
    const usedDepartment = nextFilters?.departmentId ?? departmentId;

    if (usedStart) params.set('start_date', usedStart);
    if (usedEnd) params.set('end_date', usedEnd);
    if (usedDepartment) params.set('department_id', usedDepartment);

    try {
      const query = params.toString();
      const response = await fetch(`${API_BASE_URL}/dashboard/summary${query ? `?${query}` : ''}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as DashboardSummary | { detail?: string } | null;
      if (!response.ok || !payload || !('kpis' in payload)) {
        setError(payload && 'detail' in payload && payload.detail ? payload.detail : 'Failed to load dashboard');
        setSummary(null);
        return;
      }

      setSummary(payload);
    } catch {
      setError('Unable to reach backend');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth.status === 'loading') {
      return;
    }
    void fetchDepartments();
    void fetchSummary();
  }, [auth.status, auth.token]);

  function applyFilters() {
    void fetchSummary({ startDate, endDate, departmentId });
  }

  function resetFilters() {
    setStartDate('');
    setEndDate('');
    setDepartmentId('');
    void fetchSummary({ startDate: '', endDate: '', departmentId: '' });
  }

  function exportEmployeeCountCsv() {
    if (!summary) return;
    downloadCsv(
      'employee-count-widget.csv',
      ['metric', 'value', 'role', 'department_filter', 'start_date', 'end_date'],
      [
        ['total_employees', summary.kpis.total_employees, role, departmentId || 'all', startDate || 'none', endDate || 'none'],
        ['active_employees', summary.kpis.active_employees, role, departmentId || 'all', startDate || 'none', endDate || 'none'],
        ['inactive_employees', summary.kpis.inactive_employees, role, departmentId || 'all', startDate || 'none', endDate || 'none'],
      ]
    );
  }

  function exportDepartmentBreakdownCsv() {
    if (!summary) return;
    const rows = summary.department_breakdown.map((item) => [
      item.department_name,
      item.total_employees,
      item.active_employees,
      item.inactive_employees,
      role,
      startDate || 'none',
      endDate || 'none',
    ]);

    downloadCsv(
      'department-breakdown-widget.csv',
      ['department', 'total_employees', 'active_employees', 'inactive_employees', 'role', 'start_date', 'end_date'],
      rows
    );
  }

  return (
    <Box className="min-h-screen bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <Box className="mx-auto max-w-7xl">
        <Stack spacing={2.5}>
          <Box className="rounded-[28px] border border-line/70 bg-white/85 px-6 py-6 shadow-soft backdrop-blur-sm sm:px-8">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Chip
                  icon={<InsightsRoundedIcon sx={{ color: '#4f4b9c !important' }} />}
                  label="Phase 3 Dashboard"
                  sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800 }}
                />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
                  Role-aware reporting kickoff
                </Typography>
                <Typography sx={{ mt: 0.8, color: '#5b5f7a' }}>
                  Employee count and department breakdown are live from backend data, with CSV exports for each widget.
                </Typography>
              </Box>
              <Chip label={`Signed in as ${role}`} sx={{ bgcolor: 'rgba(146, 141, 221, 0.16)', color: '#4f4b9c', fontWeight: 800 }} />
            </Stack>
          </Box>

          <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
                <TextField
                  label="Start date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel id="dashboard-department-label">Department</InputLabel>
                  <Select
                    labelId="dashboard-department-label"
                    label="Department"
                    value={departmentId}
                    onChange={(event) => setDepartmentId(event.target.value)}
                  >
                    <MenuItem value="">All departments</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={applyFilters} disabled={loading}>
                    Apply filters
                  </Button>
                  <Button variant="outlined" onClick={resetFilters} disabled={loading}>
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
            <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef' }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography sx={{ color: '#5b5f7a' }}>Loading dashboard metrics...</Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          {!loading && summary ? (
            <>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ color: '#5b5f7a', fontWeight: 700 }}>Employee Count</Typography>
                        <Button size="small" startIcon={<DownloadRoundedIcon />} onClick={exportEmployeeCountCsv}>
                          CSV
                        </Button>
                      </Stack>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: '#15162c' }}>
                        {summary.kpis.total_employees}
                      </Typography>
                      <Typography sx={{ mt: 1, color: '#5b5f7a' }}>
                        {summary.kpis.active_employees} active, {summary.kpis.inactive_employees} inactive
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef', height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ color: '#5b5f7a', fontWeight: 700 }}>Pending Approvals</Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: '#15162c' }}>
                        {summary.kpis.pending_approvals}
                      </Typography>
                      <Typography sx={{ mt: 1, color: '#5b5f7a' }}>
                        Placeholder until leave and expense workflows are enabled.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef', height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ color: '#5b5f7a', fontWeight: 700 }}>Attendance Summary</Typography>
                      <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: '#15162c', textTransform: 'capitalize' }}>
                        {summary.attendance_summary.status}
                      </Typography>
                      <Typography sx={{ mt: 1, color: '#5b5f7a' }}>
                        Present {summary.attendance_summary.present}, absent {summary.attendance_summary.absent}, late {summary.attendance_summary.late}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef' }}>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#15162c' }}>
                        Department Breakdown
                      </Typography>
                      <Typography sx={{ mt: 0.4, color: '#5b5f7a' }}>
                        Aggregated employee totals grouped by department.
                      </Typography>
                    </Box>
                    <Button size="small" startIcon={<DownloadRoundedIcon />} onClick={exportDepartmentBreakdownCsv}>
                      Export CSV
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Active</TableCell>
                          <TableCell align="right">Inactive</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.department_breakdown.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>No department data for selected filter.</TableCell>
                          </TableRow>
                        ) : (
                          summary.department_breakdown.map((row) => (
                            <TableRow key={row.department_id ?? 'unassigned'}>
                              <TableCell>{row.department_name}</TableCell>
                              <TableCell align="right">{row.total_employees}</TableCell>
                              <TableCell align="right">{row.active_employees}</TableCell>
                              <TableCell align="right">{row.inactive_employees}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 1, border: '1px solid #e7e9ef' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#15162c' }}>
                    {role} view
                  </Typography>
                  <Typography sx={{ mt: 0.6, color: '#5b5f7a' }}>
                    These role-specific sections are ready for deeper widgets in upcoming phases.
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
                    {roleWidgets.map((widget) => (
                      <Chip key={widget} label={widget} sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 700 }} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
