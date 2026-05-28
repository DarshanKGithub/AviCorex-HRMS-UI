import re

with open('app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';",
    "import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';"
)

# 2. AttendanceWidget State
old_state = """  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'ready' || !token || !user) return;

    const controller = new AbortController();

    async function fetchTodayAttendance() {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `${API_BASE_URL}/attendance?employee_id=${employeeId}&start_date=${today}&end_date=${today}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTodayAttendance(data.items?.[0] ?? null);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Failed to load dashboard attendance:', fetchError);
          setError('Unable to load attendance status right now.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTodayAttendance();

    return () => controller.abort();
  }, [employeeId, status, token, user]);

  async function handleCheckIn() {
    if (!token || !user || !employeeId) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_in_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check in');
      }

      const data = await response.json();
      setTodayAttendance({
        attendance_date: data.attendance_date,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time ?? null,
      });
      setSuccess('Attendance marked only after your click.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Failed to check in');
    } finally {
      setChecking(false);
    }
  }

  async function handleCheckOut() {
    if (!token || !user || !employeeId || !todayAttendance?.check_in_time) return;

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_out_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check out');
      }

      const data = await response.json();
      setTodayAttendance({
        attendance_date: data.attendance_date,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time ?? null,
      });
      setSuccess('Checked out only after your click.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (checkOutError) {
      setError(checkOutError instanceof Error ? checkOutError.message : 'Failed to check out');
    } finally {
      setChecking(false);
    }
  }"""

new_state = """  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance, isLoading: loading, error: fetchError } = useQuery<AttendanceRecord | null>({
    queryKey: ['attendance', employeeId, today],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/attendance?employee_id=${employeeId}&start_date=${today}&end_date=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Unable to load attendance status right now.');
      const data = await response.json();
      return data.items?.[0] ?? null;
    },
    enabled: status === 'ready' && !!token && !!user && !!employeeId,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_in_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check in');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Attendance marked only after your click.');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to check in');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          attendance_date: today,
          check_out_time: now,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || 'Failed to check out');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, today] });
      setSuccess('Checked out only after your click.');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to check out');
    }
  });
  
  const handleCheckIn = () => checkInMutation.mutate();
  const handleCheckOut = () => checkOutMutation.mutate();
  const checking = checkInMutation.isPending || checkOutMutation.isPending;
  const displayError = error || (fetchError instanceof Error ? fetchError.message : null);
"""

content = content.replace(old_state, new_state)

# 3. Replace {error && with {displayError &&
content = content.replace("{error && (", "{displayError && (")
content = content.replace("{error}", "{displayError}")

with open('app/dashboard/page.tsx', 'w') as f:
    f.write(content)
