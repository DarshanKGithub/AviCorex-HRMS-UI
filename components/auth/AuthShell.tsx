import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

interface AuthShellProps {
  children: ReactNode;
}

const highlights = [
  'Role-based dynamic access',
  'Integrated payroll & compliance',
  'Advanced timesheet tracking',
  'Enterprise-grade security'
];

const trustStats = [
  { label: 'Automation accuracy', value: '99.8%' },
  { label: 'Teams supported', value: '120+' },
  { label: 'Weekly insights', value: '24k' }
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" sx={{ background: 'radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(139,92,246,0.14), transparent 30%), linear-gradient(180deg, #fcfcfe 0%, #f3f5ff 100%)' }}>
      <div className="w-full max-w-[1240px] overflow-hidden rounded-[32px] bg-white/85 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 backdrop-blur-sm lg:grid lg:grid-cols-2">
        
        {/* Left Side: Marketing / Premium branding */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.2),transparent_38%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl animate-soft-float" />
          <div className="absolute -bottom-20 left-8 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl animate-soft-float" />
          
          <div className="relative z-10">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 34px -14px rgba(56,189,248,0.7)' }}>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>H</Typography>
              </Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
                HRMS Platform
              </Typography>
            </Box>

            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ color: '#93c5fd !important' }} />}
              label="AI-powered workforce suite"
              sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 700, mb: 2, border: '1px solid rgba(255,255,255,0.12)' }}
            />
            <Typography variant="h3" component="h1" sx={{ mt: 2, fontWeight: 700, letterSpacing: '-0.03em', color: '#f8fafc', lineHeight: 1.2 }}>
              Streamline your entire<br /> workforce operations.
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: 440, color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
              A modern, intelligent hub for HR, payroll, attendance, and team management. Built for high-growth enterprises that need calm, premium workflows.
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

          <Box sx={{ mt: 8, position: 'relative', zIndex: 10, display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {trustStats.map((stat) => (
              <Paper key={stat.label} sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.55)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', borderRadius: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>{stat.label}</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, mt: 0.5 }}>{stat.value}</Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ mt: 5, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1.5, color: '#cbd5e1' }}>
            <InsightsRoundedIcon fontSize="small" sx={{ color: '#93c5fd' }} />
            <Typography sx={{ fontSize: 13 }}>Live anomaly detection, payroll insights, and attendance intelligence in one place.</Typography>
          </Box>
        </section>

        {/* Right Side: Form */}
        <section className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.08),transparent_22%)]" />
          <div className="w-full max-w-[440px] relative z-10">
            {children}
          </div>
        </section>
      </div>
    </Box>
  );
}
