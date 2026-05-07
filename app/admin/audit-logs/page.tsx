"use client";

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AuditIcon from '@mui/icons-material/History';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  object_type: string;
  object_id: string | null;
  data: string | null;
  created_at: string;
};

type PaginatedResponse = {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
};

export default function AuditLogsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [objectType, setObjectType] = useState('');
  const [actorId, setActorId] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    if (auth.status === 'ready' && (!auth.user || auth.user.role !== 'Admin')) {
      router.push('/login');
    }
  }, [auth.status, auth.user, router]);

  // Fetch audit logs
  async function fetchLogs() {
    if (!auth.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('size', pageSize.toString());
      if (objectType) params.set('object_type', objectType);
      if (actorId) params.set('actor_id', actorId);

      const query = params.toString();
      const response = await fetch(`${API_BASE_URL}/admin/audit-logs${query ? `?${query}` : ''}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Failed to fetch audit logs');
      }

      const data = (await response.json()) as PaginatedResponse;
      setLogs(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach backend');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLogs();
  }, [auth.token, page, pageSize, objectType, actorId]);

  function handleObjectTypeChange(e: any) {
    setObjectType(e.target.value);
    setPage(1);
  }

  function handleActorIdChange(e: any) {
    setActorId(e.target.value);
    setPage(1);
  }

  function openDetailDialog(log: AuditLog) {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  }

  function closeDetailDialog() {
    setSelectedLog(null);
    setDetailDialogOpen(false);
  }

  function formatDate(isoString: string) {
    return new Date(isoString).toLocaleString();
  }

  if (auth.status === 'ready' && (!auth.user || auth.user.role !== 'Admin')) {
    return null;
  }

  return (
    <Box className="min-h-screen bg-[linear-gradient(180deg,#fcfcfe_0%,#f6f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <Box className="mx-auto max-w-7xl">
        <Breadcrumbs />
        <Stack spacing={3}>
          {/* Header */}
          <Box className="rounded-[28px] border border-line/70 bg-white/85 px-6 py-6 shadow-soft backdrop-blur-sm sm:px-8">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <Box>
                <Chip
                  icon={<AuditIcon sx={{ color: '#4f4b9c !important' }} />}
                  label="Audit Logs"
                  sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800 }}
                />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
                  System audit trail
                </Typography>
                <Typography sx={{ mt: 0.8, color: '#5b5f7a' }}>
                  View all actions performed on the system including employee, department, and organizational changes.
                </Typography>
              </Box>
              <Chip label={`Admin Access`} sx={{ bgcolor: 'rgba(146, 141, 221, 0.16)', color: '#4f4b9c', fontWeight: 800 }} />
            </Stack>
          </Box>

          {/* Filters */}
          <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end" useFlexGap flexWrap="wrap">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Object Type</InputLabel>
                  <Select value={objectType} onChange={handleObjectTypeChange} label="Object Type">
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="Department">Department</MenuItem>
                    <MenuItem value="Designation">Designation</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Actor ID"
                  placeholder="Filter by actor ID"
                  value={actorId}
                  onChange={handleActorIdChange}
                  size="small"
                  sx={{ minWidth: 200 }}
                />

                <Button
                  variant="outlined"
                  onClick={() => {
                    setObjectType('');
                    setActorId('');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Logs Table */}
          {!loading && logs.length > 0 && (
            <Card sx={{ borderRadius: 4, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Object Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Object ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Actor ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#15162c' }}>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#f8f9fb' } }}>
                          <TableCell sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>{formatDate(log.created_at)}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.action}
                              size="small"
                              sx={{
                                bgcolor:
                                  log.action === 'CREATE'
                                    ? 'rgba(76, 175, 80, 0.16)'
                                    : log.action === 'UPDATE'
                                      ? 'rgba(255, 193, 7, 0.16)'
                                      : log.action === 'DELETE'
                                        ? 'rgba(244, 67, 54, 0.16)'
                                        : 'rgba(158, 158, 158, 0.16)',
                                color:
                                  log.action === 'CREATE'
                                    ? '#4caf50'
                                    : log.action === 'UPDATE'
                                      ? '#ffc107'
                                      : log.action === 'DELETE'
                                        ? '#f44336'
                                        : '#9e9e9e',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>{log.object_type}</TableCell>
                          <TableCell sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>
                            <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{log.object_id || '-'}</code>
                          </TableCell>
                          <TableCell sx={{ color: '#5b5f7a', fontSize: '0.875rem' }}>
                            <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{log.actor_id || '-'}</code>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="text" onClick={() => openDetailDialog(log)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && logs.length === 0 && !error && (
            <Alert severity="info">No audit logs found. Try adjusting your filters.</Alert>
          )}

          {/* Pagination */}
          {!loading && total > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(_, p) => setPage(p)} />
                <Typography variant="caption" sx={{ color: '#5b5f7a' }}>
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={closeDetailDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Audit Log Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedLog && (
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>ID</Typography>
                <TextField fullWidth value={selectedLog.id} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Timestamp</Typography>
                <TextField fullWidth value={formatDate(selectedLog.created_at)} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Action</Typography>
                <TextField fullWidth value={selectedLog.action} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Object Type</Typography>
                <TextField fullWidth value={selectedLog.object_type} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Object ID</Typography>
                <TextField fullWidth value={selectedLog.object_id || '-'} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Actor ID</Typography>
                <TextField fullWidth value={selectedLog.actor_id || '-'} InputProps={{ readOnly: true }} size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e9e9e', mb: 0.5 }}>Data</Typography>
                <TextField
                  fullWidth
                  value={selectedLog.data ? JSON.stringify(JSON.parse(selectedLog.data), null, 2) : 'N/A'}
                  multiline
                  rows={6}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
