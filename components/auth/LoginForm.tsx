'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { useAuth } from '@/components/auth/AuthContext';



function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

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
          password,
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
      sx={{
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 22px 60px -30px rgba(15, 23, 42, 0.22)',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(16px)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
        <Stack spacing={0.75}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900, letterSpacing: '-0.05em', color: 'text.primary', lineHeight: 1.05 }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.96rem', maxWidth: 360, lineHeight: 1.55 }}>
            Enter your details to access your account.
          </Typography>
        </Stack>

        {formError ? (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
            {formError}
          </Alert>
        ) : null}

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2.25 }}>
          <Stack spacing={1.6}>
            <TextField
              fullWidth
              label="Work email"
              placeholder="name@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              InputLabelProps={{ sx: { color: 'text.secondary', fontWeight: 500 } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default', '& fieldset': { borderColor: 'divider' } },
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputLabelProps={{ sx: { color: 'text.secondary', fontWeight: 500 } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default', '& fieldset': { borderColor: 'divider' } },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />



            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mt: 0.25 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c3aed' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7c3aed' },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Remember me</Typography>}
              />
              <Link href="/forgot-password" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
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
                py: 1.25,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: '0 6px 20px rgba(124, 58, 237, 0.23)',
                },
              }}
            >
              {submitting ? 'Signing in...' : 'Access secure workspace'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
