"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, CardHeader, Container, Divider, Typography, CircularProgress, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/employees/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setEmployee(data))
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>Back</Button>
      <Card>
        <CardHeader title={employee ? employee.full_name : 'Employee'} subheader={employee ? employee.email : ''} />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : !employee ? (
            <Typography color="error">Employee not found.</Typography>
          ) : (
            <Box>
              <Typography variant="h6">Basic Info</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography><strong>Full name:</strong> {employee.full_name}</Typography>
              <Typography><strong>Email:</strong> {employee.email}</Typography>
              <Typography><strong>Active:</strong> {employee.is_active ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Department:</strong> {employee.department_id || '—'}</Typography>
              <Typography><strong>Designation:</strong> {employee.designation_id || '—'}</Typography>

              <Stack sx={{ mt: 2 }}>
                <Typography variant="h6">KYC / Documents (placeholders)</Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography sx={{ color: '#666' }}>Upload and display KYC documents here (placeholder).</Typography>
                <Button sx={{ mt: 1 }} variant="outlined">Upload document</Button>
              </Stack>

              <Stack sx={{ mt: 2 }}>
                <Typography variant="h6">Attachments</Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography sx={{ color: '#666' }}>Attachments viewer placeholder.</Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
