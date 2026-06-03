'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, next: string }> = {
  open: { label: 'To Do', color: '#94a3b8', icon: RadioButtonUncheckedIcon, next: 'in_progress' },
  in_progress: { label: 'In Progress', color: '#3b82f6', icon: AutorenewIcon, next: 'done' },
  done: { label: 'Done', color: '#10b981', icon: CheckCircleIcon, next: 'open' },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.open;
}

export default function TodoPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'done'>('all');

  // Quick Add Form
  const [quickTitle, setQuickTitle] = useState('');

  // Edit Modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const visibleItems = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter]
  );

  async function createTodo() {
    if (!quickTitle.trim() || !token) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: quickTitle.trim(),
          description: null,
          due_date: null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Unable to create task');
      }

      const created = await response.json();
      setItems((current) => [created, ...current]);
      setQuickTitle('');
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
    setEditDialogOpen(true);
  }

  async function updateTodo(overrideStatus?: string) {
    const targetItem = overrideStatus ? (items.find(i => i.id === editingItem?.id) || editingItem) : editingItem;
    if (!token || !targetItem) return;
    
    setSaving(true);
    setError(null);
    try {
      const statusToSave = overrideStatus || editForm.status;
      const titleToSave = overrideStatus ? targetItem.title : editForm.title;
      const descToSave = overrideStatus ? targetItem.description : editForm.description;
      const dateToSave = overrideStatus ? targetItem.due_date : editForm.due_date;

      const response = await fetch(`${API_BASE}/todo/${targetItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: titleToSave,
          description: descToSave || null,
          due_date: dateToSave || null,
          status: statusToSave,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Unable to update task');
      }

      const updated = await response.json();
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (!overrideStatus) {
        setEditDialogOpen(false);
        setEditingItem(null);
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update task');
    } finally {
      setSaving(false);
    }
  }

  async function cycleStatus(item: TodoItem) {
    const config = getStatusConfig(item.status);
    setEditingItem(item);
    await updateTodo(config.next);
    setEditingItem(null);
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

  const renderTaskRow = (item: TodoItem) => {
    const config = getStatusConfig(item.status);
    const StatusIcon = config.icon;
    const isOverdue = item.due_date && new Date(item.due_date) < new Date(new Date().setHours(0,0,0,0)) && item.status !== 'done';
    const isDone = item.status === 'done';

    return (
      <Box 
        key={item.id} 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: '#f8fafc',
            '& .actions': { opacity: 1, visibility: 'visible' }
          },
          '&:last-child': {
            borderBottom: 'none',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <IconButton 
            onClick={() => cycleStatus(item)} 
            size="small" 
            sx={{ color: config.color, mt: -0.2, '&:hover': { bgcolor: `${config.color}15` } }}
          >
            <StatusIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.3 }}>
            <Typography 
              sx={{ 
                fontWeight: 600, 
                color: isDone ? '#94a3b8' : '#1e293b', 
                fontSize: '0.95rem',
                textDecoration: isDone ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.title}
            </Typography>
            
            {(item.description || item.due_date) && (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                {item.due_date && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayIcon sx={{ fontSize: 13, color: isOverdue ? '#ef4444' : '#94a3b8' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? '#ef4444' : '#94a3b8' }}>
                      {new Date(item.due_date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                )}
                {item.description && (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                    {item.description}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Stack>

        <Stack 
          direction="row" 
          spacing={0.5} 
          className="actions"
          sx={{ 
            opacity: { xs: 1, md: 0 }, 
            visibility: { xs: 'visible', md: 'hidden' }, 
            transition: 'opacity 0.2s',
            pl: 2
          }}
        >
          <Tooltip title="Edit task">
            <IconButton size="small" onClick={() => openEditDialog(item)} sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1', bgcolor: '#eef2ff' } }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton size="small" onClick={() => deleteTodo(item.id)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: 'auto' }}>
      <Breadcrumbs />

      <Box sx={{ mb: 4, mt: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a' }}>
          Tasks
        </Typography>
        <Typography sx={{ color: '#64748b', mt: 0.5 }}>
          Press Enter to quickly add a task. Click the status icon to advance it.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
        
        {/* Header Tabs */}
        <Box sx={{ borderBottom: '1px solid #e2e8f0', px: 2, pt: 2, pb: 1.5, display: 'flex', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Stack direction="row" spacing={1}>
            {[
              { key: 'all', label: 'All' },
              { key: 'open', label: 'To Do' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'done', label: 'Done' },
            ].map((tab) => (
              <Chip
                key={tab.key}
                label={tab.label}
                clickable
                onClick={() => setStatusFilter(tab.key as any)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  height: 28,
                  bgcolor: statusFilter === tab.key ? '#0f172a' : 'transparent',
                  color: statusFilter === tab.key ? '#ffffff' : '#64748b',
                  '&:hover': { bgcolor: statusFilter === tab.key ? '#0f172a' : '#f1f5f9' }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Quick Add Input */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <TextField
            fullWidth
            placeholder="What needs to be done?"
            variant="standard"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                createTodo();
              }
            }}
            disabled={saving}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AddIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '1rem', fontWeight: 500, color: '#334155' }
            }}
          />
        </Box>

        {/* Task List */}
        <Box sx={{ minHeight: 300 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={30} />
            </Box>
          ) : visibleItems.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
                {statusFilter === 'all' ? 'All caught up! Add a new task above.' : 'No tasks in this view.'}
              </Typography>
            </Box>
          ) : (
            visibleItems.map(renderTaskRow)
          )}
        </Box>
      </Box>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Edit task</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Task title" value={editForm.title} onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))} />
            <TextField fullWidth label="Description" multiline minRows={3} value={editForm.description} onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))} />
            <TextField fullWidth label="Due date" type="date" InputLabelProps={{ shrink: true }} value={editForm.due_date} onChange={(e) => setEditForm((current) => ({ ...current, due_date: e.target.value }))} />
            <TextField select fullWidth label="Status" value={editForm.status} onChange={(e) => setEditForm((current) => ({ ...current, status: e.target.value }))} SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#ffffff' } } } }}>
              <MenuItem value="open">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={() => updateTodo()} variant="contained" disabled={saving || !editForm.title} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
