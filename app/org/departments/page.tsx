'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, Divider, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

type Dept = { id: string; name: string };

export default function DepartmentsPage() {
  const auth = useAuth();
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    if (auth.status === 'loading') return;
    fetchDepts();
  }, [auth.status]);

  async function fetchDepts() {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/departments`);
    if (res.ok) setDepts(await res.json());
    setLoading(false);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      fetchDepts();
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Card>
        <CardHeader title="Departments" subheader="Manage organization departments" />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Department name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate}>
              Add
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            {depts.map((d) => (
              <ListItem key={d.id}>
                <ListItemText primary={d.name} />
              </ListItem>
            ))}
          </List>

          {!loading && depts.length === 0 && <Typography sx={{ color: '#666' }}>No departments yet.</Typography>}
        </CardContent>
      </Card>
    </Container>
  );
}
