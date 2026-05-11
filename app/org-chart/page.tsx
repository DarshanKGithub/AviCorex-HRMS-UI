'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type OrgNode = {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  manager_id: string | null;
  children: OrgNode[];
};

function OrgNodeComponent({ node, level = 0 }: { node: OrgNode; level?: number }) {
  return (
    <Box sx={{ ml: level > 0 ? 4 : 0, mt: 2, position: 'relative' }}>
      {level > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -20,
            top: 24,
            width: 20,
            height: 1,
            bgcolor: '#cbd5e1',
          }}
        />
      )}
      {level > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -20,
            top: -16,
            width: 1,
            height: 40,
            bgcolor: '#cbd5e1',
          }}
        />
      )}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          maxWidth: 320,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'grid',
                placeItems: 'center',
                color: '#64748b',
              }}
            >
              <PersonIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {node.full_name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.5 }}>
                {node.designation || 'Employee'}
                {node.department ? ` • ${node.department}` : ''}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      {node.children && node.children.length > 0 && (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 24,
              width: 1,
              bgcolor: '#cbd5e1',
            }}
          />
          {node.children.map((child) => (
            <OrgNodeComponent key={child.id} node={child} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function OrgChartPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<OrgNode[]>([]);

  useEffect(() => {
    if (token) {
      fetchHierarchy();
    }
  }, [token]);

  async function fetchHierarchy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/org/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data || []);
      } else {
        throw new Error('Failed to load organization hierarchy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: '#e0e7ff',
            display: 'grid',
            placeItems: 'center',
            color: '#4f46e5',
          }}
        >
          <AccountTreeIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Organization Chart
          </Typography>
          <Typography sx={{ color: '#64748b' }}>
            Visualize the reporting structure of your company.
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            overflowX: 'auto',
            p: 4,
            bgcolor: '#ffffff',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            minHeight: 400,
          }}
        >
          {hierarchy.length === 0 ? (
            <Typography sx={{ color: '#64748b', textAlign: 'center', mt: 4 }}>
              No organizational data available. Assign managers to employees to build the hierarchy.
            </Typography>
          ) : (
            hierarchy.map((rootNode) => (
              <OrgNodeComponent key={rootNode.id} node={rootNode} />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
