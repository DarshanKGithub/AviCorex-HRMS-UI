import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Box>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Reset password
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Enter your email and we'll send you instructions to reset your password.
          </Typography>
        </Stack>

        <Box component="form" noValidate>
          <Stack spacing={2.5} sx={{ mt: 4 }}>
            <TextField 
              fullWidth 
              label="Work email" 
              placeholder="name@company.com" 
              InputLabelProps={{ sx: { color: '#64748b', fontWeight: 500 } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
              }}
            />
            
            <Button 
              fullWidth 
              size="large" 
              variant="contained" 
              sx={{ 
                mt: 2,
                py: 1.5,
                bgcolor: '#3b82f6', 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)'
                }
              }}
            >
              Send reset link
            </Button>

            <Typography sx={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', mt: 2 }}>
              Remembered it?{' '}
              <Link href="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </AuthShell>
  );
}