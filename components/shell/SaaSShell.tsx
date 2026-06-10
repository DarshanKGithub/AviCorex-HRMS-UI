"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

interface SaaSShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function SaaSShell({ children, title = 'GreaterHR', subtitle = 'Where Workforce Meets Insight' }: SaaSShellProps) {
  const pathname = usePathname();
  const isProtectedDashboardRoute = pathname?.startsWith('/dashboard') ?? false;
  const isAuthRoute = (pathname?.startsWith('/login') ?? false) || (pathname?.startsWith('/forgot-password') ?? false);

  if (isProtectedDashboardRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Stack spacing={4}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ maxWidth: 760 }}>
              <Chip label="SaaS Workspace" sx={{ bgcolor: '#0f172a', color: 'background.paper', fontWeight: 800, mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 950, color: 'text.primary', letterSpacing: '-0.04em' }}>{title}</Typography>
              <Typography sx={{ color: 'text.secondary', mt: 0.75, fontSize: '1rem' }}>{subtitle}</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
              <InsightsRoundedIcon sx={{ color: '#3B82F6' }} />
            </Stack>
          </Box>

          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default SaaSShell;
