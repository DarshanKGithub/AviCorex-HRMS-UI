'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from 'next/link';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useAuth } from '@/components/auth/AuthContext';

const roleOptions = ['Admin', 'HR', 'Manager', 'Employee'];
const demoAccounts: Record<string, string> = {
  Admin: 'admin@hrms.com',
  HR: 'hr@hrms.com',
  Manager: 'manager@hrms.com',
  Employee: 'employee@hrms.com'
};
const demoPassword = 'Hrms@12345';

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('HR');
  const [email, setEmail] = useState(demoAccounts.HR);
  const [password, setPassword] = useState(demoPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const demoEmail = useMemo(() => demoAccounts[selectedRole] ?? demoAccounts.HR, [selectedRole]);

  const accessCues = [
    { label: 'AI summaries', value: 'live' },
    { label: 'Adaptive RBAC', value: 'secure' },
    { label: 'Enterprise UX', value: 'clean' }
  ];

  function handleRoleChange(role: string) {
    setSelectedRole(role);

    const nextDemoEmail = demoAccounts[role] ?? demoAccounts.HR;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || Object.values(demoAccounts).includes(normalizedEmail)) {
      setEmail(nextDemoEmail);
    }

    if (!password) {
      setPassword(demoPassword);
    }
  }

  function validateForm() {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isEmailValid(email.trim())) {
      nextErrors.email = 'Enter a valid work email.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await login(
        {
          email: email.trim(),
          password
        },
        { remember: rememberMe }
      );
      router.push('/dashboard');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 20px 50px -24px rgba(15, 23, 42, 0.25)', overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1.5}>
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ color: '#2563eb !important' }} />}
            label="Premium workspace access"
            size="small"
            sx={{ width: 'fit-content', bgcolor: 'rgba(59,130,246,0.10)', color: '#1d4ed8', fontWeight: 800 }}
          />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', lineHeight: 1.05 }}>
          Welcome back
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.98rem', maxWidth: 360, lineHeight: 1.6 }}>
          Please enter your details to sign in.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: 'wrap', rowGap: 1 }}>
        {accessCues.map((cue) => (
          <Chip
            key={cue.label}
            label={`${cue.label} · ${cue.value}`}
            size="small"
            sx={{ bgcolor: '#f8fafc', color: '#475569', fontWeight: 700, border: '1px solid #e2e8f0' }}
          />
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <LinearProgress
          variant="determinate"
          value={84}
          sx={{ height: 8, borderRadius: 999, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { borderRadius: 999, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' } }}
        />
        <Typography sx={{ mt: 1, color: '#64748b', fontSize: 12, fontWeight: 600 }}>Secure session readiness</Typography>
      </Box>

      {formError ? <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{formError}</Alert> : null}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack spacing={2.5} sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Work email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            InputLabelProps={{ sx: { color: '#64748b', fontWeight: 500 } }}
            InputProps={{
              sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } },
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineRoundedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            error={Boolean(fieldErrors.password)}
            InputLabelProps={{ sx: { color: '#64748b', fontWeight: 500 } }}
            InputProps={{
              sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } },
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Login Roles
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {roleOptions.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? 'contained' : 'outlined'}
                  onClick={() => handleRoleChange(role)}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: selectedRole === role ? 'transparent' : '#e2e8f0',
                    bgcolor: selectedRole === role ? '#3b82f6' : 'transparent',
                    color: selectedRole === role ? '#ffffff' : '#475569',
                    boxShadow: selectedRole === role ? '0 4px 14px 0 rgba(59, 130, 246, 0.39)' : 'none',
                    '&:hover': {
                      bgcolor: selectedRole === role ? '#2563eb' : '#f1f5f9',
                      borderColor: selectedRole === role ? 'transparent' : '#cbd5e1',
                    }
                  }}
                >
                  {role}
                </Button>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={rememberMe} 
                  onChange={(event) => setRememberMe(event.target.checked)} 
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' } }}
                />
              }
              label={<Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Remember me</Typography>}
            />
            <Link href="/forgot-password" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Stack>

          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            disabled={submitting}
            sx={{
              mt: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
              position: 'relative',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)'
              }
            }}
          >
            {submitting ? 'Signing in...' : 'Access secure workspace'}
          </Button>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: 'center', mt: 0.5, color: '#64748b' }}>
            <ShieldRoundedIcon sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Encrypted session, role-aware access, no noisy setup.</Typography>
          </Stack>

          {/* Registration is handled by Admin/HR; self-registration removed */}
        </Stack>
      </Box>
      </CardContent>
    </Card>
  );
}
