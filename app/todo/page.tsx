'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type TodoItem = {
  id: string;
  employee_id: string;
  title: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'done' | string;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
};

function formatStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export default function TodoPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'done'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', due_date: '', status: 'open' });

  async function fetchTodos() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setItems(data.items || []);
    } catch {
      setError('Failed to load your tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, [token]);

  function resetCreateForm() {
    setTitle('');
    setDescription('');
    setDueDate('');
  }

  const counts = useMemo(() => ({
    all: items.length,
    open: items.filter((item) => item.status === 'open').length,
    in_progress: items.filter((item) => item.status === 'in_progress').length,
    done: items.filter((item) => item.status === 'done').length,
  }), [items]);

  const visibleItems = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter]
  );

  async function createTodo() {
    if (!title || !token) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description: description || null,
          due_date: dueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Unable to create task');
      }

      const created = await response.json();
      setItems((current) => [created, ...current]);
      resetCreateForm();
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : 'Unable to create task');
    } finally {
      setSaving(false);
    }
  }

  function openEditDialog(item: TodoItem) {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      due_date: item.due_date || '',
      status: item.status || 'open',
    });
    setDialogOpen(true);
  }

  async function updateTodo() {
    if (!token || !editingItem) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          due_date: editForm.due_date || null,
          status: editForm.status,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Unable to update task');
      }

      const updated = await response.json();
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDialogOpen(false);
      setEditingItem(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update task');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTodo(todoId: string) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo/${todoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Unable to delete task');
      }

      setItems((current) => current.filter((item) => item.id !== todoId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete task');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumbs />

      <Stack spacing={3}>
        <Box>
          <Chip label="To Do" sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700 }} />
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Task tracker
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 780 }}>
            Create, organize, and update your personal work items. This view saves to the backend so your tasks persist after refresh.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>Add a task</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>Capture what needs attention next.</Typography>
                <Stack spacing={2}>
                  <TextField fullWidth label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <TextField fullWidth label="Description" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  <TextField fullWidth label="Due date" type="date" InputLabelProps={{ shrink: true }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  <Button variant="contained" onClick={createTodo} disabled={!title || saving} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    {saving ? 'Saving...' : 'Add task'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>Your tasks</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Edit status, update details, or remove items when done.</Typography>
                  </Box>
                  <Button component={Link} href="/engage" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Visit Engage
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  {[
                    { key: 'all', label: `All (${counts.all})` },
                    { key: 'open', label: `Open (${counts.open})` },
                    { key: 'in_progress', label: `In progress (${counts.in_progress})` },
                    { key: 'done', label: `Done (${counts.done})` },
                  ].map((chip) => (
                    <Chip
                      key={chip.key}
                      label={chip.label}
                      clickable
                      onClick={() => setStatusFilter(chip.key as typeof statusFilter)}
                      variant={statusFilter === chip.key ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 700,
                        bgcolor: statusFilter === chip.key ? '#0f172a' : '#fff',
                        color: statusFilter === chip.key ? '#fff' : '#334155',
                        borderColor: '#cbd5e1',
                      }}
                    />
                  ))}
                </Stack>

                <Divider sx={{ mb: 2.5 }} />

                {loading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
                    <CircularProgress />
                  </Box>
                ) : visibleItems.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {statusFilter === 'all' ? 'No tasks yet. Add your first item on the left.' : 'No tasks match the selected filter.'}
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {visibleItems.map((item) => (
                      <Card key={item.id} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardContent>
                          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                                <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{item.title}</Typography>
                                <Chip label={formatStatus(item.status)} size="small" sx={{ fontWeight: 700 }} />
                              </Stack>
                              {item.description && <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{item.description}</Typography>}
                              {item.due_date && (
                                <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 12 }}>Due {new Date(item.due_date).toLocaleDateString()}</Typography>
                              )}
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Button size="small" variant="outlined" onClick={() => openEditDialog(item)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                                Edit
                              </Button>
                              <Button size="small" color="error" variant="outlined" onClick={() => deleteTodo(item.id)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                                Delete
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Edit task</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Task title"
              value={editForm.title}
              onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              minRows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Due date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editForm.due_date}
              onChange={(e) => setEditForm((current) => ({ ...current, due_date: e.target.value }))}
            />
            <TextField
              select
              fullWidth
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm((current) => ({ ...current, status: e.target.value }))}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
          <Button onClick={updateTodo} variant="contained" disabled={saving || !editForm.title} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
