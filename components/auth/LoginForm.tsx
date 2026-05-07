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
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import { useAuth } from '@/components/auth/AuthContext';

const roleOptions = ['Admin', 'HR', 'Manager', 'Employee', 'CEO'];
const demoAccounts: Record<string, string> = {
  Admin: 'admin@hrms.com',
  HR: 'hr@hrms.com',
  Manager: 'manager@hrms.com',
  Employee: 'employee@hrms.com',
  CEO: 'ceo@hrms.com'
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
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: '1px solid rgba(231, 233, 239, 0.95)',
        background: 'rgba(255, 255, 255, 0.78)',
        boxShadow: '0 16px 40px rgba(17, 24, 39, 0.08)',
        backdropFilter: 'blur(18px)'
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1.2}>
          <Typography variant="overline" sx={{ letterSpacing: 1.8, color: '#928ddd', fontWeight: 800 }}>
            Secure access
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
            Sign in to HRMS
          </Typography>
          <Typography sx={{ color: '#5b5f7a', lineHeight: 1.7 }}>
            A polished entry point for your HRMS SaaS with a clean, enterprise-grade feel.
          </Typography>
        </Stack>

        {formError ? <Alert severity="error" sx={{ mt: 3 }}>{formError}</Alert> : null}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack spacing={2.2} sx={{ mt: 4 }}>
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
              helperText={fieldErrors.email ?? 'Use your HRMS account email.'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon fontSize="small" />
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
              helperText={fieldErrors.password ?? 'Demo password: Hrms@12345'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Box>
              <Typography sx={{ mb: 1.2, fontSize: 14, fontWeight: 700, color: '#1f2340' }}>Select role preview</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {roleOptions.map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={selectedRole === role ? 'contained' : 'outlined'}
                    onClick={() => handleRoleChange(role)}
                    startIcon={<BusinessCenterRoundedIcon fontSize="small" />}
                    sx={{
                      minWidth: 0,
                      px: 1.8,
                      py: 0.9,
                      borderColor: selectedRole === role ? 'transparent' : '#e7e9ef',
                      bgcolor: selectedRole === role ? '#928ddd' : 'transparent',
                      color: selectedRole === role ? '#ffffff' : '#1f2340',
                      '&:hover': {
                        bgcolor: selectedRole === role ? '#7f79c9' : 'rgba(178, 174, 242, 0.08)'
                      }
                    }}
                  >
                    {role}
                  </Button>
                ))}
              </Stack>
              <Typography sx={{ mt: 1, fontSize: 13, color: '#5b5f7a' }}>
                Demo account: {selectedRole} using {demoEmail}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <FormControlLabel
                control={<Switch checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />}
                label="Remember me"
              />
              <Link href="/forgot-password" style={{ color: '#928ddd', fontWeight: 700 }}>
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
                mt: 0.5,
                bgcolor: '#928ddd',
                boxShadow: '0 12px 24px rgba(146, 141, 221, 0.3)',
                '&:hover': {
                  bgcolor: '#7f79c9'
                }
              }}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>

            <Divider />

            <Typography sx={{ textAlign: 'center', color: '#5b5f7a' }}>
              New here?{' '}
              <Link href="/register" style={{ color: '#928ddd', fontWeight: 700 }}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
