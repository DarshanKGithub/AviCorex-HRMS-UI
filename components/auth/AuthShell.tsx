import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface AuthShellProps {
  children: ReactNode;
}

const highlights = [
  'Role-based access',
  'Attendance-ready workflows',
  'Payroll-safe structure',
  'SaaS-ready UI system'
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[32px] border border-line/80 bg-[rgba(252,252,254,0.8)] shadow-soft backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden border-b border-line/70 bg-hero-glow p-8 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-hero-grid bg-[size:24px_24px] opacity-50" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              
              <Typography variant="h3" component="h1" sx={{ mt: 3, fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c' }}>
                HRMS built for serious operations.
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 560, color: '#5b5f7a', fontSize: '1.05rem', lineHeight: 1.8 }}>
                A neat, clean SaaS surface for admin, HR, manager, employee, and CEO workflows, designed to grow into payroll, attendance, compliance, and analytics.
              </Typography>
            </div>

            <Stack spacing={1.5} sx={{ mt: 6 }}>
              {highlights.map((item) => (
                <Paper
                  key={item}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.72)',
                    borderColor: 'rgba(231, 233, 239, 0.9)'
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: '#928ddd', boxShadow: '0 0 0 6px rgba(146, 141, 221, 0.14)' }} />
                  <Typography sx={{ fontWeight: 600, color: '#1f2340' }}>{item}</Typography>
                </Paper>
              ))}
            </Stack>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </Box>
  );
}
