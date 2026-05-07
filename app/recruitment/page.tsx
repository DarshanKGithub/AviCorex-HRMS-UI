'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Typography, Alert, CircularProgress, Chip, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface JobPosting {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  status: string;
  created_at: string;
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  created_at: string;
}

export default function RecruitmentPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  const [openJobModal, setOpenJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', location: '', employment_type: 'Full-time', description: '' });
  
  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role || '');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  async function fetchData() {
    setLoading(true);
    try {
      const [jobsRes, candsRes] = await Promise.all([
        fetch(`${API_BASE}/recruitment/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        isAdminOrHR ? fetch(`${API_BASE}/recruitment/candidates`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
      ]);
      
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.items);
      }
      
      if (candsRes && candsRes.ok) {
        const cData = await candsRes.json();
        setCandidates(cData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createJob() {
    try {
      const res = await fetch(`${API_BASE}/recruitment/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(jobForm)
      });
      if (res.ok) {
        setOpenJobModal(false);
        setJobForm({ title: '', location: '', employment_type: 'Full-time', description: '' });
        fetchData();
      } else {
        alert('Failed to create job posting');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon color="primary" /> 
          Recruitment & ATS
        </Typography>
        {isAdminOrHR && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpenJobModal(true)}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none', fontWeight: 600 }}
          >
            Post a Job
          </Button>
        )}
      </Stack>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Tab label="Job Openings" icon={<WorkIcon fontSize="small" />} iconPosition="start" />
        {isAdminOrHR && <Tab label="Candidate Pool" icon={<PeopleIcon fontSize="small" />} iconPosition="start" />}
      </Tabs>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : activeTab === 0 ? (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Posted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6b7280' }}>No active job postings.</TableCell>
                </TableRow>
              ) : (
                jobs.map(job => (
                  <TableRow key={job.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{job.title}</TableCell>
                    <TableCell>{job.location || 'Remote'}</TableCell>
                    <TableCell>{job.employment_type}</TableCell>
                    <TableCell>
                      <Chip label={job.status} size="small" sx={{ bgcolor: job.status === 'Open' ? '#dcfce7' : '#f3f4f6', color: job.status === 'Open' ? '#166534' : '#4b5563', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Candidate Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Applied On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6b7280' }}>No candidates in the pool yet.</TableCell>
                </TableRow>
              ) : (
                candidates.map(cand => (
                  <TableRow key={cand.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{cand.first_name} {cand.last_name}</TableCell>
                    <TableCell>{cand.email}</TableCell>
                    <TableCell>{cand.phone || 'N/A'}</TableCell>
                    <TableCell>{cand.source || 'Direct'}</TableCell>
                    <TableCell>{new Date(cand.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Job Modal */}
      <Dialog open={openJobModal} onClose={() => setOpenJobModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Post a New Job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Job Title" fullWidth value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
            <TextField label="Location" fullWidth value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. New York, Remote" />
            <TextField label="Employment Type" fullWidth value={jobForm.employment_type} onChange={e => setJobForm({...jobForm, employment_type: e.target.value})} />
            <TextField label="Job Description" fullWidth multiline rows={4} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenJobModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={createJob} sx={{ bgcolor: '#3b82f6', textTransform: 'none' }} disabled={!jobForm.title || !jobForm.description}>
            Create Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
