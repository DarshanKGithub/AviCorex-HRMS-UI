import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface AuthShellProps {
  children: ReactNode;
}

const highlights = [
  'Role-based dynamic access',
  'Integrated payroll & compliance',
  'Advanced timesheet tracking',
  'Enterprise-grade security'
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] ring-1 ring-slate-200 lg:grid lg:grid-cols-2">
        
        {/* Left Side: Marketing / Premium branding */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative z-10">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>H</Typography>
              </Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
                HRMS Platform
              </Typography>
            </Box>

            <Typography variant="h3" component="h1" sx={{ mt: 2, fontWeight: 700, letterSpacing: '-0.03em', color: '#f8fafc', lineHeight: 1.2 }}>
              Streamline your entire<br /> workforce operations.
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: 440, color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
              A modern, intelligent hub for HR, payroll, attendance, and team management. Built for high-growth enterprises.
            </Typography>
          </div>

          <Stack spacing={2} sx={{ mt: 8, position: 'relative', zIndex: 10 }}>
            {highlights.map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleRoundedIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.95rem' }}>{item}</Typography>
              </Box>
            ))}
          </Stack>
        </section>

        {/* Right Side: Form */}
        <section className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </section>
      </div>
    </Box>
  );
}
