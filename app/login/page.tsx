import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthShell>
      <Stack spacing={2.5}>
        
        <LoginForm />
      </Stack>
    </AuthShell>
  );
}
