import re

with open('app/employees/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { useForm, Controller } from 'react-hook-form';",
    "import { useForm, Controller } from 'react-hook-form';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';"
)

# 2. State & Hooks
old_hooks = """  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [chainOpen, setChainOpen] = useState(false);
  const [managerChain, setManagerChain] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [designations, setDesignations] = useState<Option[]>([]);"""

new_hooks = """  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [chainOpen, setChainOpen] = useState(false);
  const [managerChain, setManagerChain] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  const { data: deptsData = [] } = useQuery<Option[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/org/departments`, { headers: { Authorization: `Bearer ${auth.token}` } });
      if (!res.ok) throw new Error('Failed to fetch departments');
      return res.json();
    },
    enabled: !!auth.token,
    staleTime: 5 * 60 * 1000,
  });
  const departments = deptsData;

  const { data: desigsData = [] } = useQuery<Option[]>({
    queryKey: ['designations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/org/designations`, { headers: { Authorization: `Bearer ${auth.token}` } });
      if (!res.ok) throw new Error('Failed to fetch designations');
      return res.json();
    },
    enabled: !!auth.token,
    staleTime: 5 * 60 * 1000,
  });
  const designations = desigsData;

  const { data: employeesData, isLoading: loading } = useQuery({
    queryKey: ['employees', page, size, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (q) params.set('q', q);
      const res = await fetch(`${API_BASE_URL}/employees/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`Unable to fetch employees (${res.status})`);
      return res.json();
    },
    enabled: auth.status === 'ready' && !!auth.token,
  });
  const employees = employeesData?.items || [];
  const total = employeesData?.total || 0;
"""
content = content.replace(old_hooks, new_hooks)

# 3. Replace useEffect logic
old_use_effect = """  useEffect(() => {
    if (auth.status === 'loading') return;
    fetchLookups();
    fetchEmployees();
  }, [auth.status]);

  async function fetchLookups() {
    try {
      const headers: Record<string, string> = {};
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const [dres, rres] = await Promise.all([
        fetch(`${API_BASE_URL}/org/departments`, { headers }),
        fetch(`${API_BASE_URL}/org/designations`, { headers }),
      ]);
      if (dres.ok) setDepartments(await dres.json());
      if (rres.ok) setDesignations(await rres.json());
    } catch (e) {
      // ignore
    }
  }"""
content = content.replace(old_use_effect, "")

# 4. Mutations
old_delete = """  async function handleDeleteConfirmed() {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    setDeletingId(id);
    if (!auth.token) {
      setToastMsg('Authentication error');
      setToastSeverity('error');
      setToastOpen(true);
      setDeletingId(null);
      return;
    }
    try {
      const response: Response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.ok) {
        setToastMsg('Employee deleted');
        setToastSeverity('success');
        setToastOpen(true);
        // refresh page (if last item on page removed, go back a page)
        const newTotal = Math.max(0, total - 1);
        const lastPage = Math.max(1, Math.ceil(newTotal / size));
        const desired = lastPage >= page ? page : lastPage;
        setPage(desired);
        await fetchEmployees();
      } else {
        const body = await response.json().catch(() => ({}));
        setToastMsg((body && body.detail) || `Delete failed (${response.status})`);
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setDeletingId(null);
    }
  }"""

new_delete = """  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body && body.detail) || `Delete failed (${response.status})`);
      }
      return response.json();
    },
    onSuccess: () => {
      setToastMsg('Employee deleted');
      setToastSeverity('success');
      setToastOpen(true);
      const newTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / size));
      const desired = lastPage >= page ? page : lastPage;
      setPage(desired);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    }
  });
  const deletingId = deleteMutation.variables;
  async function handleDeleteConfirmed() {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    deleteMutation.mutate(id);
  }"""
content = content.replace(old_delete, new_delete)

old_save = """  const saveEdit = async (data: EmployeeEditFormValues) => {
    if (!editingId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setToastMsg('Employee updated successfully');
        setToastSeverity('success');
        setToastOpen(true);
        setEditingId(null);
        await fetchEmployees();
      } else {
        const body = await response.json().catch(() => ({}));
        setToastMsg((body && body.detail) || 'Failed to update employee');
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setSaving(false);
      setEditConfirmOpen(false);
    }
  };"""

new_save = """  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: EmployeeEditFormValues }) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body && body.detail) || 'Failed to update employee');
      }
      return response.json();
    },
    onSuccess: () => {
      setToastMsg('Employee updated successfully');
      setToastSeverity('success');
      setToastOpen(true);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setToastMsg(err?.message || 'Network error');
      setToastSeverity('error');
      setToastOpen(true);
    },
    onSettled: () => {
      setEditConfirmOpen(false);
    }
  });
  const saving = updateMutation.isPending;
  const saveEdit = async (data: EmployeeEditFormValues) => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data });
  };"""
content = content.replace(old_save, new_save)

# 5. Remove fetchEmployees function
old_fetch = """  async function fetchEmployees(p?: number) {
    const usedPage = p ?? page;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(usedPage));
      params.set('size', String(size));
      if (q) params.set('q', q);

      const headers: Record<string, string> = {};
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const res = await fetch(`${API_BASE_URL}/employees/?${params.toString()}`, { headers });
      if (res.ok) {
        const body = await res.json();
        setEmployees(body.items || []);
        setTotal(body.total || 0);
        setPage(body.page || usedPage);
      } else {
        const body = await res.json().catch(() => ({}));
        setToastMsg((body && body.detail) || `Unable to fetch employees (${res.status})`);
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Failed to fetch employees');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }"""
content = content.replace(old_fetch, "")

# 6. Button mapping fetchEmployees
content = content.replace("fetchEmployees(Math.max(1, page - 1))", "setPage(Math.max(1, page - 1))")
content = content.replace("fetchEmployees(page + 1)", "setPage(page + 1)")
content = content.replace("fetchEmployees(1)", "setPage(1)")

with open('app/employees/page.tsx', 'w') as f:
    f.write(content)

