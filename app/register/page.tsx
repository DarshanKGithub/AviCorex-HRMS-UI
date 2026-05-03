import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell>
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
              Create account
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
              Register for HRMS
            </Typography>
            
          </Stack>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <TextField fullWidth label="Full name" placeholder="Jane Doe" />
            <TextField fullWidth label="Work email" placeholder="name@company.com" />
            <TextField fullWidth type="password" label="Password" placeholder="Create a password" />
            <TextField fullWidth type="password" label="Confirm password" placeholder="Confirm password" />
            
            <Button fullWidth size="large" variant="contained" sx={{ bgcolor: '#928ddd', boxShadow: '0 12px 24px rgba(146, 141, 221, 0.3)' }}>
              Create account
            </Button>

            <Box sx={{ textAlign: 'center', color: '#5b5f7a' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#928ddd', fontWeight: 700 }}>
                Sign in
              </Link>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </AuthShell>
  );
}