'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, Divider, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useAuth } from '@/components/auth/AuthContext';

type Des = { id: string; name: string };

export default function DesignationsPage() {
  const auth = useAuth();
  const [list, setList] = useState<Des[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    if (auth.status === 'loading') return;
    fetchList();
  }, [auth.status]);

  async function fetchList() {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designations`);
    if (res.ok) setList(await res.json());
    setLoading(false);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      fetchList();
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardHeader title="Designations" subheader="Manage role titles and designations" />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Designation name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate}>
              Add
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            {list.map((d) => (
              <ListItem key={d.id}>
                <ListItemText primary={d.name} />
              </ListItem>
            ))}
          </List>

          {!loading && list.length === 0 && <Typography sx={{ color: '#666' }}>No designations yet.</Typography>}
        </CardContent>
      </Card>
    </Container>
  );
}
