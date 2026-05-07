'use client';

import { Box, Container, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedShell } from '@/components/shell/ProtectedShell';

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export default function AttendanceLayout({ children }: AttendanceLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on pathname
  const getTabValue = () => {
    if (pathname.includes('/attendance/timesheets')) return 0;
    if (pathname.includes('/attendance/overtime')) return 1;
    if (pathname.includes('/attendance/comp-off')) return 2;
    if (pathname.includes('/attendance/shifts')) return 3;
    if (pathname.includes('/attendance/info')) return 4;
    return 4;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const paths = ['/attendance/timesheets', '/attendance/overtime', '/attendance/comp-off', '/attendance/shifts', '/attendance/info'];
    router.push(paths[newValue]);
  };

  return (
    <ProtectedShell>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Tabs
            value={getTabValue()}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtonsDisplay={isMobile ? 'auto' : 'off'}
            sx={{
              mb: 3,
              borderBottom: '2px solid #e5e7eb',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab label="Timesheets" />
            <Tab label="Overtime" />
            <Tab label="Comp-Off" />
            <Tab label="Shifts" />
            <Tab label="Regularization" />
          </Tabs>

          <Box>{children}</Box>
        </Container>
      </Box>
    </ProtectedShell>
  );
}
