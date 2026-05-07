'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface DocumentWithEmployee {
  id: string;
  employee_id: string;
  employee_name: string;
  document_type: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
}

export default function DocumentCenterPage() {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        setError('Failed to fetch documents');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      // Re-using the download endpoint from the employee route since it uses doc_id
      const res = await fetch(`${API_BASE}/employees/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Failed to download file');
      }
    } catch (err) {
      alert('Network error during download');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertDriveFileIcon color="primary" /> 
          Document Center
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Document Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Uploaded On</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8, color: '#6b7280' }}>
                  No documents found in the system.
                </TableCell>
              </TableRow>
            ) : (
              documents.map(doc => (
                <TableRow key={doc.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{doc.employee_name}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: '#e0f2fe', color: '#0369a1', borderRadius: 1, fontWeight: 600 }}>
                      {doc.document_type}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#4b5563' }}>{doc.file_name}</TableCell>
                  <TableCell sx={{ color: '#4b5563' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton edge="end" onClick={() => handleDownload(doc.id, doc.file_name)} sx={{ color: '#3b82f6' }}>
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
