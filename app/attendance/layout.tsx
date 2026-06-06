'use client';

import { Box, Container } from '@mui/material';
import { ProtectedShell } from '@/components/shell/ProtectedShell';

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export default function AttendanceLayout({ children }: AttendanceLayoutProps) {
  return (
    <ProtectedShell>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box>{children}</Box>
        </Container>
      </Box>
    </ProtectedShell>
  );
}
