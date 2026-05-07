'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface OrgNode {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  manager_id: string | null;
  children: OrgNode[];
}

const OrgNodeComponent = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
  return (
    <Box sx={{ pl: level > 0 ? 4 : 0, position: 'relative', mt: 2 }}>
      {/* Vertical Line for children */}
      {level > 0 && (
        <Box sx={{ position: 'absolute', left: 16, top: -16, bottom: 24, width: 2, bgcolor: '#e5e7eb' }} />
      )}
      {/* Horizontal Line connecting to card */}
      {level > 0 && (
        <Box sx={{ position: 'absolute', left: 16, top: 24, width: 16, height: 2, bgcolor: '#e5e7eb' }} />
      )}
      
      <Card 
        sx={{ 
          display: 'inline-block', 
          minWidth: 250, 
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          position: 'relative',
          zIndex: 1,
          bgcolor: level === 0 ? '#f0fdf4' : 'white'
        }}
      >
        <CardContent sx={{ p: 2, pb: '16px !important' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937' }}>
            {node.full_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>
            {node.designation || 'No Designation'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'inline-block', mt: 1, px: 1, py: 0.25, bgcolor: '#e0f2fe', color: '#0369a1', borderRadius: 1, fontWeight: 600 }}>
            {node.department || 'No Department'}
          </Typography>
        </CardContent>
      </Card>

      {node.children && node.children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {node.children.map(child => (
            <OrgNodeComponent key={child.id} node={child} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default function OrganizationHierarchyPage() {
  const { token } = useAuth();
  const [hierarchy, setHierarchy] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchHierarchy();
    }
  }, [token]);

  async function fetchHierarchy() {
    try {
      const res = await fetch(`${API_BASE}/org/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      } else {
        setError('Failed to fetch organization hierarchy');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon color="primary" /> 
          Organization Hierarchy
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : hierarchy.length === 0 ? (
        <Alert severity="info">No organization hierarchy data available.</Alert>
      ) : (
        <Box sx={{ overflowX: 'auto', pb: 4 }}>
          {hierarchy.map(rootNode => (
            <OrgNodeComponent key={rootNode.id} node={rootNode} level={0} />
          ))}
        </Box>
      )}
    </Box>
  );
}
