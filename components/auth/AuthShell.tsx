import type { ReactNode } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box
      className="h-screen w-full overflow-hidden"
      sx={{
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at top left, rgba(139,92,246,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(139,92,246,0.16), transparent 30%)',
      }}
    >
      <div className="grid h-full w-full lg:grid-cols-[1.18fr_0.82fr]">
        <section className="relative hidden h-full overflow-hidden bg-[#000000] px-8 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-12 xl:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.24),transparent_36%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-22" />
          <div className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-[0_14px_34px_-16px_rgba(15,23,42,0.5)]">
              <Image src="/logo.png" alt="HRMS logo" width={46} height={46} className="h-11 w-11 rounded-xl object-cover" priority />
            </div>
            <div>
              <Typography sx={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>
                HRMS
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Workforce Suite
              </Typography>
            </div>
          </div>

          <div className="relative z-10 max-w-[520px]">
            <Typography variant="h3" component="h1" sx={{ mt: 2.5, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.06, fontSize: { xs: '2.4rem', xl: '3.25rem' } }}>
              One login for your entire HRMS.
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 420, color: 'rgba(255,255,255,0.8)', fontSize: '0.96rem', lineHeight: 1.6 }}>
              Manage payroll, attendance, approvals, and employee workspaces from a modern SaaS entry point.
            </Typography>
          </div>

          <Box sx={{ position: 'relative', zIndex: 10, mt: 5, display: 'grid', gap: 1.2 }}>
            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: 'rgba(10, 27, 51, 0.56)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.8 }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Key features
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, mt: 0.5 }}>
                    Complete HR management
                  </Typography>
                </Box>
                <Box sx={{ width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'rgba(139,92,246,0.18)' }}>
                  <TrendingUpRoundedIcon sx={{ color: '#c4b5fd' }} />
                </Box>
              </Stack>
              <Box sx={{ display: 'grid', gap: 1.4 }}>
                {[
                  { label: 'Payroll Management', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> },
                  { label: 'Attendance Tracking', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> },
                  { label: 'Request Approvals', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{ color: '#a78bfa' }}>{item.icon}</Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1.2} sx={{ mt: 2.2 }}>
                {[
                  { label: 'Managers', icon: <GroupsRoundedIcon sx={{ fontSize: 16 }} /> },
                  { label: 'Insights', icon: <InsightsRoundedIcon sx={{ fontSize: 16 }} /> },
                ].map((item) => (
                  <Box key={item.label} sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.08)', px: 1.4, py: 1.1 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ mt: 2.5, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1.5, color: 'rgba(255,255,255,0.76)' }}>
            <InsightsRoundedIcon fontSize="small" sx={{ color: '#ddd6fe' }} />
            <Typography sx={{ fontSize: 13 }}>Built for a clean HR experience, not a cluttered form.</Typography>
          </Box>
        </section>

        <section className="relative flex h-full items-center justify-center px-5 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.07),transparent_22%)]" />
          <div className="relative z-10 w-full max-w-[500px]">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70">
                <Image src="/logo.png" alt="HRMS logo" width={42} height={42} className="h-10 w-10 rounded-xl object-cover" priority />
              </div>
              <div>
                <Typography sx={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700 }}>
                  HRMS
                </Typography>
                <Typography sx={{ fontSize: 18, color: 'text.primary', fontWeight: 800, letterSpacing: '-0.03em' }}>Workforce Suite</Typography>
              </div>
            </div>
            {children}
          </div>
        </section>
      </div>
    </Box>
  );
}
