'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Skeleton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { API_BASE_URL } from '@/lib/apiBase';

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
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ employee_id: '', document_type: 'Other' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API_BASE_URL}/documents`, {
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

  const handleUpload = async () => {
    if (!uploadForm.employee_id || !selectedFile) {
      setError('Please provide employee ID and select a file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('employee_id', uploadForm.employee_id);
      formData.append('document_type', uploadForm.document_type);
      formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setOpenUploadModal(false);
        setUploadForm({ employee_id: '', document_type: 'Other' });
        setSelectedFile(null);
        fetchDocuments();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.detail || 'Failed to upload document');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertDriveFileIcon color="primary" /> 
          Document Center
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<UploadFileIcon />} 
          onClick={() => setOpenUploadModal(true)}
          sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 600 }}
        >
          Upload Document
        </Button>
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
              <>
                {[1,2,3].map((r) => (
                  <TableRow key={r}>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={48} /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Card sx={{ display: 'inline-block', borderRadius: 2 }}>
                    <CardContent sx={{ py: 4, px: 6, textAlign: 'center' }}>
                      <InsertDriveFileIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                      <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>No documents found</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Upload documents to make them available to the team.</Typography>
                    </CardContent>
                  </Card>
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
                  <TableCell sx={{ color: 'text.secondary' }}>{doc.file_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton edge="end" onClick={() => handleDownload(doc.id, doc.file_name)} sx={{ color: '#7c3aed' }}>
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField 
              label="Employee ID" 
              fullWidth 
              value={uploadForm.employee_id} 
              onChange={(e) => setUploadForm({ ...uploadForm, employee_id: e.target.value })} 
            />
            <TextField 
              select 
              label="Document Type" 
              fullWidth 
              value={uploadForm.document_type} 
              onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
            >
              {['ID Proof', 'Offer Letter', 'Resume', 'Certificate', 'Other'].map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1.5 }}>
              {selectedFile ? selectedFile.name : 'Choose File'}
              <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenUploadModal(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload} 
            disabled={!uploadForm.employee_id || !selectedFile || uploading}
            sx={{ bgcolor: '#7c3aed', textTransform: 'none' }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
