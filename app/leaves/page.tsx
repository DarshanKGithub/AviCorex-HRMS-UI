'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../../components/auth/AuthContext';
import { useEmployeeId } from '@/components/auth/useEmployeeId';
import { usePermissions } from '../../components/auth/usePermissions';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { apiFetch, buildApiUrl, getApiBaseUrl, isNetworkFetchError } from '@/lib/apiBase';
import { useToast } from '@/components/providers/ToastProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leaveRequestSchema = z.object({
  leave_type_id: z.string().min(1, 'Please select a leave type.'),
  start_date: z.string().min(1, 'Please provide a valid start date.'),
  end_date: z.string().min(1, 'Please provide a valid end date.'),
  session_from: z.string(),
  session_to: z.string(),
  reason: z.string().optional(),
  contact_details: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date cannot be before start date.',
        path: ['end_date']
      });
    } else if (data.start_date === data.end_date && data.session_from === 'Session 2' && data.session_to === 'Session 1') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'For same-day leave, session range is invalid.',
        path: ['session_to']
      });
    }
  }
});

const commonCardStyles = {
  borderRadius: 0,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  bgcolor: '#ffffff',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
};

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;


type LeaveBalance = {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  leave_type_name?: string;
  year: number;
  granted_days: number;
  balance_days: number;
  created_at: string;
  updated_at: string;
};

type CCOption = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type CCOptionsPublic = {
  manager: CCOption | null;
  hr: CCOption[];
  ceo: CCOption[];
};

type LeaveHistoryItem = {
  id: string;
  action: string;
  actor_name?: string;
  created_at: string;
};

type LeaveRequest = {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
};

type LeaveType = {
  id: string;
  name: string;
  description?: string;
  default_days_per_year: number;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function LeavesPage() {
  const auth = useAuth();
  const employeeId = useEmployeeId();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [balancesWithDetails, setBalancesWithDetails] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('all');
  const [selectedPendingRequestIds, setSelectedPendingRequestIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [apiUnreachable, setApiUnreachable] = useState<string | null>(null);
  const [ccOptions, setCcOptions] = useState<CCOptionsPublic | null>(null);
  const [historyDialogRequest, setHistoryDialogRequest] = useState<LeaveRequest | null>(null);
  const [historyItems, setHistoryItems] = useState<LeaveHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    mode: 'onChange',
    defaultValues: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      session_from: 'Session 1',
      session_to: 'Session 2',
      reason: '',
      contact_details: '',
    }
  });

  const formLeaveTypeId = watch('leave_type_id');
  const formStartDate = watch('start_date');
  const formEndDate = watch('end_date');


  const canRequestLeave = hasPermission('request_leave');
  const canApproveLeave = hasPermission('approve_leave');
  const leaveTypeNameById = useMemo(
    () => new Map(leaveTypes.map((type) => [type.id, type.name])),
    [leaveTypes]
  );
  const leaveTypeIdByName = useMemo(
    () => new Map(leaveTypes.map((type) => [type.name.toLowerCase(), type.id])),
    [leaveTypes]
  );
  const leaveOptions = useMemo(() => leaveTypes.map((type) => type.name), [leaveTypes]);

  useEffect(() => {
    if (auth.status === 'ready' && !auth.user) {
      router.push('/login');
    } else if (auth.status === 'ready' && auth.token) {
      fetchLeaveTypes();
      fetchBalances();
      fetchBalancesWithDetails();
      fetchRequests();
      fetchCcOptions();
    }
  }, [auth.status, auth.token, router, canApproveLeave]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'apply') {
      setTabValue(0);
    } else if (tab === 'pending') {
      setTabValue(1);
    } else if (tab === 'history') {
      setTabValue(2);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!balancesWithDetails.length) {
      return;
    }

    const availableYears = [...new Set(balancesWithDetails.map((balance) => balance.year))].sort((a, b) => b - a);
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [balancesWithDetails, selectedYear]);

  async function fetchLeaveTypes() {
    if (!auth.token) return;
    try {
      const res = await apiFetch(buildApiUrl('/leave/types'), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setApiUnreachable(null);
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(data || []);
      } else if (res.status !== 401) {
        console.error('Error fetching leave types:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
      if (isNetworkFetchError(err)) {
        setApiUnreachable(err instanceof Error ? err.message : `Cannot reach API at ${getApiBaseUrl()}`);
      }
    }
  }

  async function fetchCcOptions() {
    if (!auth.token) return;
    try {
      const res = await apiFetch(buildApiUrl('/leave/cc-options'), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCcOptions(data);
      }
    } catch (err) {
      console.error('Error fetching cc options:', err);
    }
  }

  async function openHistory(request: LeaveRequest) {
    setHistoryDialogRequest(request);
    setHistoryLoading(true);
    try {
      const res = await apiFetch(buildApiUrl(`/leave/requests/${request.id}/history`), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchBalances() {
    if (!auth.token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(buildApiUrl('/leave/balances'), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setApiUnreachable(null);
      if (res.ok) {
        const data = await res.json();
        setBalances(data || []);
      } else if (res.status !== 401) {
        console.error('Error fetching balances:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
      if (isNetworkFetchError(err)) {
        setApiUnreachable(err instanceof Error ? err.message : `Cannot reach API at ${getApiBaseUrl()}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchBalancesWithDetails() {
    if (!auth.token) return;
    try {
      const res = await apiFetch(buildApiUrl('/leave/balances/with-details'), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setApiUnreachable(null);
      if (res.ok) {
        const data = await res.json();
        setBalancesWithDetails(data || []);
      } else if (res.status !== 401) {
        console.error('Error fetching balances with details:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching balances with details:', err);
      if (isNetworkFetchError(err)) {
        setApiUnreachable(err instanceof Error ? err.message : `Cannot reach API at ${getApiBaseUrl()}`);
      }
    }
  }

  async function fetchRequests() {
    if (!auth.token) return;
    try {
      const res = await apiFetch(
        buildApiUrl('/leave/requests', {
          employee_id: !hasPermission('view_leave') && employeeId ? employeeId : undefined,
        }),
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      let allRequests: LeaveRequest[] = [];
      if (res.ok) {
        const payload = await res.json();
        allRequests = payload.items || [];
      }

      if (auth.user?.role === 'Manager') {
        const teamRes = await apiFetch(
          buildApiUrl('/leave/requests/team'),
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        if (teamRes.ok) {
          const teamPayload = await teamRes.json();
          const teamRequests = teamPayload.items || [];
          const existingIds = new Set(allRequests.map(r => r.id));
          for (const req of teamRequests) {
            if (!existingIds.has(req.id)) {
              allRequests.push(req);
              existingIds.add(req.id);
            }
          }
        }
      }

      setRequests(allRequests);
      setApiUnreachable(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests([]);
      if (isNetworkFetchError(err)) {
        setApiUnreachable(err instanceof Error ? err.message : `Cannot reach API at ${getApiBaseUrl()}`);
        setError(err instanceof Error ? err.message : 'Unable to connect to the GreaterHR API.');
      }
    }
  }

  const submitRequest = async (data: LeaveRequestFormValues) => {
    if (!auth.token) return;
    if (!canRequestLeave) {
      setError('You do not have permission to submit leave requests.');
      return;
    }



    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create the leave request
      const res = await apiFetch(buildApiUrl('/leave/requests'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          leave_type_id: data.leave_type_id,
          start_date: data.start_date,
          end_date: data.end_date,
          session_from: data.session_from,
          session_to: data.session_to,
          reason: data.reason,
          contact_details: data.contact_details,
          cc_to: ccEmails,
          attachment_paths: [],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Unable to create leave request');
        return;
      }

      const leaveRequest = await res.json();

      // Step 2: Upload files if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);

          try {
            const uploadRes = await apiFetch(buildApiUrl(`/leave/requests/${leaveRequest.id}/upload`), {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
              body: formData,
            });

            if (!uploadRes.ok) {
              console.warn(`Failed to upload file ${file.name}`);
            }
          } catch (uploadErr) {
            console.warn(`Error uploading file ${file.name}:`, uploadErr);
          }
        }
      }

      await fetchRequests();
      reset();
      setCcEmails([]);
      setCcInput('');
      setAttachments([]);
      setSuccess('Leave request created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function approve(requestId: string, approve: boolean) {
    if (!auth.token) return;
    if (!canApproveLeave) {
      setError('You do not have permission to approve leave requests.');
      return;
    }
    try {
      const res = await apiFetch(buildApiUrl(`/leave/requests/${requestId}/approve`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ approve }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Unable to update');
        return;
      }
      setSuccess(approve ? 'Leave approved!' : 'Leave rejected!');
      setTimeout(() => setSuccess(null), 2000);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      setError('Error updating request');
    }
  }

  async function bulkApprove(approve: boolean) {
    if (!auth.token || !canApproveLeave) {
      return;
    }
    if (selectedPendingRequestIds.length === 0) {
      setError('Select at least one pending request first.');
      return;
    }

    setBulkActionLoading(true);
    setError(null);
    try {
      const res = await apiFetch(buildApiUrl('/leave/requests/bulk-approve'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ request_ids: selectedPendingRequestIds, approve }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.detail || 'Unable to process bulk action');
        return;
      }

      const payload = await res.json();
      setSuccess(
        approve
          ? `Bulk approve completed: ${payload.approved} approved, ${payload.failed} failed.`
          : `Bulk reject completed: ${payload.rejected} rejected, ${payload.failed} failed.`
      );
      setSelectedPendingRequestIds([]);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      setError('Network error while processing bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  }

  const normalizeStatus = (status: string) => status.toLowerCase();

  const getStatusColor = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
      case 'pending_manager':
      case 'pending_hr':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'approved':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <CloseIcon sx={{ fontSize: 16 }} />;
      case 'pending':
      case 'pending_manager':
      case 'pending_hr':
        return <HourglassTopIcon sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  const formatStatusLabel = (status: string) => {
    const s = normalizeStatus(status);
    if (s === 'pending_manager') return 'Pending (Manager)';
    if (s === 'pending_hr') return 'Pending (HR)';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const resolveLeaveTypeLabel = (leaveTypeId: string) => leaveTypeNameById.get(leaveTypeId) ?? leaveTypeId;

  const handleCategoryClick = (category: string) => {
    const leaveTypeId = leaveTypeIdByName.get(category.toLowerCase());
    if (!leaveTypeId) {
      setError(`Leave type "${category}" is not available right now.`);
      return;
    }

    setError(null);
    setSelectedCategory(category);
    setTabValue(0);
    setValue('leave_type_id', leaveTypeId, { shouldValidate: true });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    if (!formLeaveTypeId) {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory(resolveLeaveTypeLabel(formLeaveTypeId));
  }, [formLeaveTypeId, leaveTypeNameById]);

  const yearOptions = [...new Set([new Date().getFullYear(), ...balancesWithDetails.map((balance) => balance.year)])].sort((a, b) => b - a);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tab = newValue === 0 ? 'apply' : newValue === 1 ? 'pending' : 'history';
    router.replace(`/leaves?tab=${tab}`);
  };

  const currentYearBalances = balancesWithDetails.filter((b) => b.year === selectedYear);
  const pendingRequests = requests.filter((r) => normalizeStatus(r.status).startsWith('pending'));
  const historyRequests = requests.filter((r) => !normalizeStatus(r.status).startsWith('pending'));
  const filteredPendingRequests = pendingRequests.filter((request) => {
    const leaveTypeName = resolveLeaveTypeLabel(request.leave_type_id).toLowerCase();
    const statusText = request.status.toLowerCase();
    const searchTarget = `${leaveTypeName} ${statusText} ${request.start_date} ${request.end_date}`;
    const matchesSearch = pendingSearch.trim() === '' || searchTarget.includes(pendingSearch.trim().toLowerCase());
    const matchesType = pendingTypeFilter === 'all' || request.leave_type_id === pendingTypeFilter;
    return matchesSearch && matchesType;
  });

  const leaveAnalytics = useMemo(() => {
    const totalDaysRequested = requests.reduce((acc, request) => acc + (request.days_requested || 0), 0);
    return {
      totalRequests: requests.length,
      pending: pendingRequests.length,
      approved: requests.filter((request) => normalizeStatus(request.status) === 'approved').length,
      rejected: requests.filter((request) => normalizeStatus(request.status) === 'rejected').length,
      totalDaysRequested,
    };
  }, [requests]);

  const allVisiblePendingSelected =
    filteredPendingRequests.length > 0 &&
    filteredPendingRequests.every((request) => selectedPendingRequestIds.includes(request.id));

  const selectedCount = selectedPendingRequestIds.length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfe', py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box className="mx-auto max-w-7xl">
        <Breadcrumbs sx={{ mb: 3 }} />
        {/* Alerts */}
        {apiUnreachable && (
          <Alert severity="warning" onClose={() => setApiUnreachable(null)} sx={{ mb: 2 }}>
            {apiUnreachable}
          </Alert>
        )}
        {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

          {loading ? (
            <Box sx={{ py: 2 }}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3, mb: 2 }} />
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton variant="rounded" height={110} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Card ref={formRef} sx={{ ...commonCardStyles, border: '1px solid #e7e9ef', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #eef2f7', bgcolor: '#fcfdff' }}>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Total Requests', value: leaveAnalytics.totalRequests, color: 'text.primary' },
                    { label: 'Pending', value: leaveAnalytics.pending, color: '#d97706' },
                    { label: 'Approved', value: leaveAnalytics.approved, color: '#059669' },
                    { label: 'Rejected', value: leaveAnalytics.rejected, color: '#dc2626' },
                    { label: 'Requested Days', value: leaveAnalytics.totalDaysRequested, color: '#4f46e5' },
                  ].map((metric) => (
                    <Grid key={metric.label} item xs={6} sm={4} md={3} lg={2}>
                      <Card sx={{ ...commonCardStyles, border: '1px solid #eef2f7' }}>
                        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>{metric.label}</Typography>
                          <Typography sx={{ fontSize: '1.1rem', color: metric.color, fontWeight: 800 }}>{metric.value}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Tab Navigation */}
              <Box sx={{ borderBottom: '1px solid #e7e9ef', bgcolor: '#fafbfd' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-indicator': {
                      bgcolor: '#6366f1',
                      height: 3,
                      borderRadius: 3
                    },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#64748b',
                      py: 1.5,
                      '&.Mui-selected': {
                        color: '#6366f1',
                      },
                    },
                  }}
                >
                  <Tab label="Apply" />
                  <Tab label="Pending" />
                  <Tab label="History" />
                </Tabs>
              </Box>

              {/* Tab Panel: Apply */}
              <TabPanel value={tabValue} index={0}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 3.5, fontSize: '1.1rem' }}>
                    Applying for Leave
                  </Typography>
                  {!canRequestLeave && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      You do not have permission to submit leave requests.
                    </Alert>
                  )}
                  <form onSubmit={handleSubmit(submitRequest)}>
                    <Stack spacing={3}>
                      {/* Leave Type */}
                      <Box>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: 'text.secondary' }}>Leave type *</InputLabel>
                          <Controller
                            name="leave_type_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label="Leave type *"
                                error={!!errors.leave_type_id}
                                MenuProps={{ PaperProps: { sx: { bgcolor: '#ffffff' } } }}
                                sx={{
                                  bgcolor: '#fafbfd',
                                  borderRadius: 1.5,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e7e9ef',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#d0cee4',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#928ddd',
                                  },
                                }}
                              >
                                <MenuItem value="">Select type</MenuItem>
                                {leaveTypes.map((type) => (
                                  <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Box>

                      {/* Date Range Row */}
                      {/* Dates Row */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                            From date *
                          </Typography>
                          <Controller
                            name="start_date"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="date"
                                fullWidth
                                size="small"
                                error={!!errors.start_date}
                                helperText={errors.start_date?.message}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: '#fafbfd',
                                    borderRadius: 1.5,
                                    '& fieldset': { borderColor: '#e7e9ef' },
                                    '&:hover fieldset': { borderColor: '#d0cee4' },
                                    '&.Mui-focused fieldset': { borderColor: '#928ddd' },
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                            To date *
                          </Typography>
                          <Controller
                            name="end_date"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="date"
                                fullWidth
                                size="small"
                                error={!!errors.end_date}
                                helperText={errors.end_date?.message}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: '#fafbfd',
                                    borderRadius: 1.5,
                                    '& fieldset': { borderColor: '#e7e9ef' },
                                    '&:hover fieldset': { borderColor: '#d0cee4' },
                                    '&.Mui-focused fieldset': { borderColor: '#928ddd' },
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>



                      {/* Applying To */}
                      <Box sx={{ p: 2.5, bgcolor: '#fafbfd', borderRadius: 1.5, border: '1px solid #e7e9ef', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#928ddd', width: 40, height: 40, fontSize: '0.9rem' }}>
                          {auth.user?.full_name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>
                            Applying to
                          </Typography>
                          <Typography sx={{ fontSize: '0.95rem', color: 'text.primary', fontWeight: 600 }}>
                            {auth.user?.full_name}
                          </Typography>
                        </Box>
                      </Box>

                      {/* CC To */}
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>
                          CC to
                        </Typography>
                        <Stack spacing={1.5}>
                          {ccEmails.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              {ccEmails.map((email, idx) => (
                                <Chip
                                  key={idx}
                                  label={email}
                                  onDelete={() => setCcEmails(ccEmails.filter((_, i) => i !== idx))}
                                  sx={{
                                    bgcolor: 'rgba(146, 141, 221, 0.1)',
                                    color: '#928ddd',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                    mb: 1,
                                  }}
                                />
                              ))}
                            </Stack>
                          )}
                          <Stack direction="row" spacing={1}>
                            <TextField
                              value={ccInput}
                              onChange={(e) => setCcInput(e.target.value)}
                              placeholder="Enter email"
                              fullWidth
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#fafbfd',
                                  borderRadius: 1.5,
                                  '& fieldset': { borderColor: '#e7e9ef' },
                                  '&:hover fieldset': { borderColor: '#d0cee4' },
                                  '&.Mui-focused fieldset': { borderColor: '#928ddd' },
                                },
                              }}
                            />
                            <IconButton
                              onClick={() => {
                                const sanitizedEmail = ccInput.trim().toLowerCase();
                                if (
                                  sanitizedEmail &&
                                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail) &&
                                  !ccEmails.includes(sanitizedEmail)
                                ) {
                                  setCcEmails([...ccEmails, sanitizedEmail]);
                                  setCcInput('');
                                }
                              }}
                              sx={{
                                bgcolor: 'rgba(146, 141, 221, 0.1)',
                                color: '#928ddd',
                                '&:hover': { bgcolor: 'rgba(146, 141, 221, 0.2)' },
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Stack>
                          
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                            {ccOptions?.manager && !ccEmails.includes(ccOptions.manager.email.toLowerCase()) && (
                              <Chip
                                label={`+ Manager: ${ccOptions.manager.name}`}
                                onClick={() => setCcEmails([...ccEmails, ccOptions.manager!.email.toLowerCase()])}
                                sx={{ bgcolor: '#f0f9ff', color: '#0369a1', fontSize: '0.75rem', cursor: 'pointer', mb: 1, fontWeight: 500 }}
                              />
                            )}
                            {auth.user?.role === 'Employee' && ccOptions?.hr?.map((hr) => !ccEmails.includes(hr.email.toLowerCase()) && (
                              <Chip
                                key={hr.id}
                                label={`+ HR: ${hr.name}`}
                                onClick={() => setCcEmails([...ccEmails, hr.email.toLowerCase()])}
                                sx={{ bgcolor: '#fdf4ff', color: '#86198f', fontSize: '0.75rem', cursor: 'pointer', mb: 1, fontWeight: 500 }}
                              />
                            ))}
                            {auth.user?.role === 'Employee' && ccOptions?.ceo?.map((ceo) => !ccEmails.includes(ceo.email.toLowerCase()) && (
                              <Chip
                                key={ceo.id}
                                label={`+ CEO: ${ceo.name}`}
                                onClick={() => setCcEmails([...ccEmails, ceo.email.toLowerCase()])}
                                sx={{ bgcolor: '#fefce8', color: '#a16207', fontSize: '0.75rem', cursor: 'pointer', mb: 1, fontWeight: 500 }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Contact Details */}
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                          Contact details
                        </Typography>
                        <Controller
                          name="contact_details"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              placeholder="Enter your contact details"
                              fullWidth
                              multiline
                              rows={2}
                              error={!!errors.contact_details}
                              helperText={errors.contact_details?.message}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#fafbfd',
                                  borderRadius: 1.5,
                                  '& fieldset': { borderColor: '#e7e9ef' },
                                  '&:hover fieldset': { borderColor: '#d0cee4' },
                                  '&.Mui-focused fieldset': { borderColor: '#928ddd' },
                                },
                              }}
                            />
                          )}
                        />
                      </Box>

                      {/* Reason */}
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                          Reason
                        </Typography>
                        <Controller
                          name="reason"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              placeholder="Enter a reason"
                              fullWidth
                              multiline
                              rows={3}
                              error={!!errors.reason}
                              helperText={errors.reason?.message}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#fafbfd',
                                  borderRadius: 1.5,
                                  '& fieldset': { borderColor: '#e7e9ef' },
                                  '&:hover fieldset': { borderColor: '#d0cee4' },
                                  '&.Mui-focused fieldset': { borderColor: '#928ddd' },
                                },
                              }}
                            />
                          )}
                        />
                      </Box>

                      {/* File Upload */}
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>
                          Attach File (PDF only, max 5MB)
                        </Typography>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{
                            borderColor: '#e7e9ef',
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: 1.5,
                            py: 1,
                            '&:hover': {
                              borderColor: '#928ddd',
                              bgcolor: 'rgba(146, 141, 221, 0.04)',
                            },
                          }}
                        >
                          Upload
                          <input
                            hidden
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                const validFiles = Array.from(e.target.files).filter(file => {
                                  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                                    showToast(`File ${file.name} is not a PDF.`, 'error');
                                    return false;
                                  }
                                  if (file.size > 5 * 1024 * 1024) {
                                    showToast(`File ${file.name} exceeds the 5MB limit.`, 'error');
                                    return false;
                                  }
                                  return true;
                                });
                                setAttachments([...attachments, ...validFiles]);
                              }
                              e.target.value = '';
                            }}
                          />
                        </Button>
                        {attachments.length > 0 && (
                          <Stack spacing={1} sx={{ mt: 1.5 }}>
                            {attachments.map((file, idx) => (
                              <Typography
                                key={idx}
                                sx={{
                                  fontSize: '0.85rem',
                                  color: 'text.secondary',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 1,
                                  bgcolor: '#fafbfd',
                                  borderRadius: 1,
                                }}
                              >
                                {file.name}
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setAttachments(attachments.filter((_, i) => i !== idx))
                                  }
                                >
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      {/* Submit Buttons */}
                      <Stack direction="row" spacing={2} sx={{ pt: 2, borderTop: '1px solid #e7e9ef' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting || !formLeaveTypeId || !formStartDate || !formEndDate || !canRequestLeave}
                          sx={{
                            bgcolor: '#928ddd',
                            color: '#fff',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            '&:hover': { bgcolor: '#7a76c4' },
                            '&:disabled': { bgcolor: '#d1d5db', color: '#9ca3af' },
                          }}
                        >
                          {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} /> : null}
                          Submit
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            reset();
                            setCcEmails([]);
                            setCcInput('');
                            setAttachments([]);
                          }}
                          sx={{
                            color: 'text.secondary',
                            borderColor: '#e7e9ef',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            '&:hover': {
                              bgcolor: '#fafbfd',
                              borderColor: '#d0cee4',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </form>
                </CardContent>
              </TabPanel>

              {/* Tab Panel: Pending */}
              <TabPanel value={tabValue} index={1}>
                <CardContent sx={{ p: 3.5 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={pendingTypeFilter}
                        label="Type"
                        onChange={(e) => setPendingTypeFilter(e.target.value)}
                        MenuProps={{ PaperProps: { sx: { bgcolor: '#ffffff' } } }}
                      >
                        <MenuItem value="all">All types</MenuItem>
                        {leaveTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {canApproveLeave && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="success"
                          disabled={bulkActionLoading || selectedCount === 0}
                          onClick={() => void bulkApprove(true)}
                          sx={{ textTransform: 'none' }}
                        >
                          Bulk Approve ({selectedCount})
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={bulkActionLoading || selectedCount === 0}
                          onClick={() => void bulkApprove(false)}
                          sx={{ textTransform: 'none' }}
                        >
                          Bulk Reject ({selectedCount})
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  {filteredPendingRequests.length > 0 ? (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                          <TableRow sx={{ borderBottom: '2px solid #e7e9ef' }}>
                            {canApproveLeave && (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={allVisiblePendingSelected}
                                  indeterminate={!allVisiblePendingSelected && selectedPendingRequestIds.length > 0}
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      setSelectedPendingRequestIds(filteredPendingRequests.map((request) => request.id));
                                    } else {
                                      setSelectedPendingRequestIds([]);
                                    }
                                  }}
                                />
                              </TableCell>
                            )}
                            {canApproveLeave && <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Employee</TableCell>}
                            <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Leave Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Date Range</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2, textAlign: 'center' }}>Days</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Status</TableCell>
                            {canApproveLeave && <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPendingRequests.map((r) => (
                            <TableRow key={r.id} sx={{ borderBottom: '1px solid #e7e9ef', '&:hover': { bgcolor: '#f9fafb' } }}>
                              {canApproveLeave && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedPendingRequestIds.includes(r.id)}
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        setSelectedPendingRequestIds((current) => [...current, r.id]);
                                      } else {
                                        setSelectedPendingRequestIds((current) => current.filter((id) => id !== r.id));
                                      }
                                    }}
                                  />
                                </TableCell>
                              )}
                              {canApproveLeave && <TableCell sx={{ py: 2 }}>{r.employee_name || 'Unknown'}</TableCell>}
                              <TableCell sx={{ color: 'text.primary', fontWeight: 500, py: 2 }}>{resolveLeaveTypeLabel(r.leave_type_id)}</TableCell>
                              <TableCell sx={{ color: 'text.secondary', py: 2 }}>
                                {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell sx={{ color: 'text.primary', fontWeight: 500, textAlign: 'center', py: 2 }}>{r.days_requested}</TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip
                                  icon={getStatusIcon(r.status)}
                                  label={formatStatusLabel(r.status)}
                                  sx={{
                                    bgcolor: `${getStatusColor(r.status)}15`,
                                    color: getStatusColor(r.status),
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                  }}
                                />
                              </TableCell>
                              {canApproveLeave && (
                                <TableCell sx={{ py: 2 }}>
                                  {normalizeStatus(r.status).startsWith('pending') ? (
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => approve(r.id, true)}
                                        sx={{
                                          bgcolor: '#10b981',
                                          color: '#fff',
                                          fontWeight: 600,
                                          textTransform: 'none',
                                          fontSize: '0.8rem',
                                          py: 0.5,
                                          px: 1.5,
                                          borderRadius: 1.5,
                                          '&:hover': { bgcolor: '#059669' },
                                        }}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => approve(r.id, false)}
                                        sx={{
                                          color: '#ef4444',
                                          borderColor: '#ef4444',
                                          fontWeight: 600,
                                          textTransform: 'none',
                                          fontSize: '0.8rem',
                                          py: 0.5,
                                          px: 1.5,
                                          borderRadius: 1.5,
                                          '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </Stack>
                                  ) : (
                                    <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>-</Typography>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <HourglassTopIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                      <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>No pending requests</Typography>
                    </Box>
                  )}
                </CardContent>
              </TabPanel>

              {/* Tab Panel: History */}
              <TabPanel value={tabValue} index={2}>
                <CardContent sx={{ p: 3.5 }}>
                  {historyRequests.length > 0 ? (
                    <Stack spacing={1.5}>
                      {historyRequests.map((r) => (
                        <Box
                          key={r.id}
                          sx={{
                            border: '1px solid #e7e9ef',
                            borderLeft: `4px solid ${getStatusColor(r.status)}`,
                            borderRadius: 1.5,
                            p: 2,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {resolveLeaveTypeLabel(r.leave_type_id)}
                                {r.employee_name && ` • ${r.employee_name}`}
                              </Typography>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()} ({r.days_requested} day(s))
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Button size="small" variant="outlined" onClick={() => openHistory(r)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                                View History
                              </Button>
                              <Chip
                                icon={getStatusIcon(r.status)}
                                label={formatStatusLabel(r.status)}
                                sx={{
                                  alignSelf: 'center',
                                  bgcolor: `${getStatusColor(r.status)}15`,
                                  color: getStatusColor(r.status),
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <EventAvailableIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                      <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>No history available</Typography>
                    </Box>
                  )}
                </CardContent>
              </TabPanel>
            </Card>
          )}
        </Box>
      </Box>

      {/* History Dialog */}
      <Dialog open={!!historyDialogRequest} onClose={() => setHistoryDialogRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Leave Approval History</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#fafbfd' }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : historyItems.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {historyItems.map((item, idx) => (
                <ListItem key={item.id} sx={{ bgcolor: '#fff', mb: 1, borderRadius: 1.5, border: '1px solid #e7e9ef' }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.action === 'create' ? 'Requested' : item.action === 'approve' ? 'Approved' : 'Rejected'}
                        {item.actor_name ? ` by ${item.actor_name}` : ''}
                      </Typography>
                    }
                    secondary={new Date(item.created_at).toLocaleString()}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>No history found.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fcfdff' }}>
          <Button onClick={() => setHistoryDialogRequest(null)} variant="outlined" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
