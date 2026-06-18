"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, CardHeader, Container, Divider, Typography, CircularProgress, Stack, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '@/components/auth/AuthContext';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_BASE_URL = getApiBaseUrl();

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    
    Promise.all([
      fetch(`${API_BASE_URL}/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE_URL}/employees/${id}/documents`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : [])
    ])
    .then(([empData, docsData]) => {
      setEmployee(empData);
      setDocuments(docsData || []);
    })
    .finally(() => setLoading(false));
  }, [id, token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'General'); // Default to General, could be expanded to a dropdown

    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [...prev, newDoc]);
      } else {
        alert('Failed to upload document');
      }
    } catch (err) {
      alert('Network error during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/documents/${docId}/download`, {
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton 
          onClick={() => router.back()} 
          sx={{ 
            bgcolor: 'background.paper', 
            border: '1px solid #e2e8f0', 
            borderRadius: 2,
            boxShadow: '0 2px 4px -1px rgba(0,0,0,0.03)',
            color: 'text.secondary',
            '&:hover': { bgcolor: '#f1f5f9', color: 'text.primary' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
          {employee ? employee.full_name : 'Employee Profile'}
        </Typography>
      </Stack>

      <Card sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px -12px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {loading ? (
            <CircularProgress />
          ) : !employee ? (
            <Typography color="error">Employee not found.</Typography>
          ) : (
            <Box>
              <Typography variant="h6">Basic Info</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography><strong>Full name:</strong> {employee.full_name}</Typography>
              <Typography><strong>Email:</strong> {employee.email}</Typography>
              <Typography><strong>Active:</strong> {employee.is_active ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Department:</strong> {employee.department_id || '—'}</Typography>
              <Typography><strong>Designation:</strong> {employee.designation_id || '—'}</Typography>

              <Stack sx={{ mt: 4 }}>
                <Typography variant="h6">Documents</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    sx={{ textTransform: 'none' }}
                  >
                    Upload Document
                  </Button>
                </Box>

                {documents.length === 0 ? (
                  <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No documents uploaded yet.</Typography>
                ) : (
                  <List sx={{ bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #e5e7eb' }}>
                    {documents.map((doc) => (
                      <ListItem 
                        key={doc.id}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDownload(doc.id, doc.file_name)} sx={{ color: '#7C3AED' }}>
                            <DownloadIcon />
                          </IconButton>
                        }
                        sx={{ borderBottom: '1px solid #f3f4f6', '&:last-child': { borderBottom: 'none' } }}
                      >
                        <ListItemIcon>
                          <InsertDriveFileIcon sx={{ color: '#9ca3af' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={doc.file_name} 
                          secondary={`${doc.document_type} • Uploaded ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
