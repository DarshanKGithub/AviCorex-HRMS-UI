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
      <Card
        elevation={0}
        sx={{
          borderRadius: 6,
          border: '1px solid rgba(231, 233, 239, 0.95)',
          background: 'rgba(255, 255, 255, 0.78)',
          boxShadow: '0 16px 40px rgba(17, 24, 39, 0.08)',
          backdropFilter: 'blur(18px)'
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1.2}>
            <Typography variant="overline" sx={{ letterSpacing: 1.8, color: '#928ddd', fontWeight: 800 }}>
              Account recovery
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#15162c' }}>
              Reset your password
            </Typography>
            <Typography sx={{ color: '#5b5f7a', lineHeight: 1.7 }}>
              Placeholder recovery flow for the Phase 1 auth experience.
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <TextField fullWidth label="Work email" placeholder="name@company.com" />
            <Button fullWidth size="large" variant="contained" sx={{ bgcolor: '#928ddd', boxShadow: '0 12px 24px rgba(146, 141, 221, 0.3)' }}>
              Send reset link
            </Button>

            <Box sx={{ textAlign: 'center', color: '#5b5f7a' }}>
              Remembered it?{' '}
              <Link href="/login" style={{ color: '#928ddd', fontWeight: 700 }}>
                Back to sign in
              </Link>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </AuthShell>
  );
}