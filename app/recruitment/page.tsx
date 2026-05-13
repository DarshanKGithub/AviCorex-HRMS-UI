'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Skeleton,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type JobPosting = {
  id: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  status: string;
  created_at: string;
};

type Candidate = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  parsed_skills: string | null;
  created_at: string;
};

type JobApplication = {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  applied_at: string;
};

type Interview = {
  id: string;
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
  feedback: string | null;
  rating: number | null;
  created_at: string;
};

type ParseResult = {
  parsed_skills: string[];
  summary: string;
};

const APPLICATION_STATUS_OPTIONS = ['Applied', 'Screening', 'Interviewing', 'Offered', 'Hired', 'Rejected'];
const INTERVIEW_STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled'];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function RecruitmentPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);

  const [openJobModal, setOpenJobModal] = useState(false);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);
  const [openApplicationModal, setOpenApplicationModal] = useState(false);
  const [openInterviewModal, setOpenInterviewModal] = useState(false);

  const [jobForm, setJobForm] = useState({ title: '', location: '', employment_type: 'Full-time', description: '', requirements: '', status: 'Open' });
  const [candidateForm, setCandidateForm] = useState({ first_name: '', last_name: '', email: '', phone: '', source: 'Website', resume_text: '' });
  const [applicationForm, setApplicationForm] = useState({ job_id: '', candidate_id: '', status: 'Applied' });
  const [interviewForm, setInterviewForm] = useState({ application_id: '', scheduled_at: '', meeting_link: '' });

  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role || '');
  const recruitmentStats = [
    { label: 'Open roles', value: jobs.length, accent: '#6d28d9' },
    { label: 'Candidates', value: candidates.length, accent: '#16a34a' },
    { label: 'Applications', value: applications.length, accent: '#7c3aed' },
    { label: 'Interviews', value: interviews.length, accent: '#dc2626' },
  ];

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const jobMap = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const candidateMap = useMemo(() => new Map(candidates.map((candidate) => [candidate.id, candidate])), [candidates]);
  const applicationMap = useMemo(() => new Map(applications.map((application) => [application.id, application])), [applications]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const requests: Promise<Response | null>[] = [
        fetch(`${API_BASE}/recruitment/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
      ];

      if (isAdminOrHR) {
        requests.push(
          fetch(`${API_BASE}/recruitment/candidates`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/recruitment/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/recruitment/interviews`, { headers: { Authorization: `Bearer ${token}` } }),
        );
      }

      const responses = await Promise.all(requests);
      const [jobsRes, candidatesRes, applicationsRes, interviewsRes] = responses;

      if (jobsRes?.ok) {
        const data = await jobsRes.json();
        setJobs(data.items || []);
      }

      if (isAdminOrHR) {
        if (candidatesRes?.ok) {
          const data = await candidatesRes.json();
          setCandidates(data || []);
        }
        if (applicationsRes?.ok) {
          const data = await applicationsRes.json();
          setApplications(data || []);
        }
        if (interviewsRes?.ok) {
          const data = await interviewsRes.json();
          setInterviews(data || []);
        }
      }
    } catch {
      setError('Unable to load recruitment data right now.');
    } finally {
      setLoading(false);
    }
  }

  async function createJob() {
    setError(null);
    const res = await fetch(`${API_BASE}/recruitment/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: jobForm.title,
        location: jobForm.location || null,
        employment_type: jobForm.employment_type || null,
        description: jobForm.description,
        requirements: jobForm.requirements || null,
        status: jobForm.status,
      }),
    });

    if (res.ok) {
      setOpenJobModal(false);
      setJobForm({ title: '', location: '', employment_type: 'Full-time', description: '', requirements: '', status: 'Open' });
      fetchData();
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.detail || 'Failed to create job posting');
  }

  async function parseResume() {
    setError(null);
    if (!candidateForm.resume_text.trim()) {
      setCandidateSkills([]);
      return;
    }

    const res = await fetch(`${API_BASE}/recruitment/candidates/parse-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ resume_text: candidateForm.resume_text }),
    });

    if (res.ok) {
      const payload: ParseResult = await res.json();
      setCandidateSkills(payload.parsed_skills || []);
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.detail || 'Unable to parse resume text');
  }

  async function createCandidate() {
    setError(null);
    const res = await fetch(`${API_BASE}/recruitment/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        first_name: candidateForm.first_name,
        last_name: candidateForm.last_name,
        email: candidateForm.email,
        phone: candidateForm.phone || null,
        source: candidateForm.source || null,
        resume_text: candidateForm.resume_text || null,
      }),
    });

    if (res.ok) {
      setOpenCandidateModal(false);
      setCandidateForm({ first_name: '', last_name: '', email: '', phone: '', source: 'Website', resume_text: '' });
      setCandidateSkills([]);
      fetchData();
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.detail || 'Failed to create candidate');
  }

  async function createApplication() {
    setError(null);
    const res = await fetch(`${API_BASE}/recruitment/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(applicationForm),
    });

    if (res.ok) {
      setOpenApplicationModal(false);
      setApplicationForm({ job_id: '', candidate_id: '', status: 'Applied' });
      fetchData();
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.detail || 'Failed to create application');
  }

  async function createInterview() {
    setError(null);
    const res = await fetch(`${API_BASE}/recruitment/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        application_id: interviewForm.application_id,
        interviewer_id: user?.id,
        scheduled_at: interviewForm.scheduled_at,
        meeting_link: interviewForm.meeting_link || null,
      }),
    });

    if (res.ok) {
      setOpenInterviewModal(false);
      setInterviewForm({ application_id: '', scheduled_at: '', meeting_link: '' });
      fetchData();
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.detail || 'Failed to schedule interview');
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumbs />
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 5, overflow: 'hidden', bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px -24px rgba(15,23,42,0.45)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 24%), radial-gradient(circle at bottom left, rgba(124,58,237,0.16), transparent 28%)' }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
              <Box sx={{ maxWidth: 720 }}>
                <Chip label="Recruitment Intelligence" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 800, border: '1px solid rgba(255,255,255,0.12)' }} />
                <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                  Recruitment & ATS, redesigned like a premium SaaS command surface.
                </Typography>
                <Typography sx={{ mt: 1, color: 'rgba(226,232,240,0.78)', maxWidth: 620 }}>
                  Manage jobs, candidates, applications, and interviews with a calmer hierarchy and AI-friendly scanning.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: '#93c5fd !important' }} />} label="Resume parsing" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Chip icon={<InsightsRoundedIcon sx={{ color: '#86efac !important' }} />} label="Hiring signals" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
              </Stack>
            </Stack>

            {isAdminOrHR && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3, position: 'relative' }}>
                <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={parseResume} sx={{ textTransform: 'none', fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,0.18)' }}>
                  Parse resume text
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenJobModal(true)} sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 700 }}>
                  New job
                </Button>
                <Button variant="contained" startIcon={<PeopleIcon />} onClick={() => setOpenCandidateModal(true)} sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700 }}>
                  New candidate
                </Button>
                <Button variant="contained" startIcon={<AssignmentIndIcon />} onClick={() => setOpenApplicationModal(true)} sx={{ bgcolor: '#6d28d9', textTransform: 'none', fontWeight: 700 }}>
                  New application
                </Button>
                <Button variant="contained" startIcon={<EventNoteIcon />} onClick={() => setOpenInterviewModal(true)} sx={{ bgcolor: '#7c3aed', textTransform: 'none', fontWeight: 700 }}>
                  New interview
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={2.5} sx={{ mb: 0 }}>
          {recruitmentStats.map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item.label}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>{item.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: item.accent }}>{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Jobs', value: jobs.length, color: '#dbeafe' },
          { label: 'Candidates', value: candidates.length, color: '#dcfce7' },
          { label: 'Applications', value: applications.length, color: '#ede9fe' },
          { label: 'Interviews', value: interviews.length, color: '#fee2e2' },
        ].map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.label}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>{item.label}</Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: 'text.primary' }}>{item.value}</Typography>
                <Box sx={{ mt: 1.5, width: 56, height: 8, borderRadius: 999, bgcolor: item.color }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={activeTab} onChange={(_, next) => setActiveTab(next)} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Tab label="Job Openings" icon={<WorkIcon fontSize="small" />} iconPosition="start" />
        {isAdminOrHR && <Tab label="Candidates" icon={<PeopleIcon fontSize="small" />} iconPosition="start" />}
        {isAdminOrHR && <Tab label="Applications" icon={<AssignmentIndIcon fontSize="small" />} iconPosition="start" />}
        {isAdminOrHR && <Tab label="Interviews" icon={<EventNoteIcon fontSize="small" />} iconPosition="start" />}
      </Tabs>

      {loading ? (
        <Stack spacing={2.5} sx={{ my: 2 }}>
          <Skeleton variant="rounded" height={68} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        </Stack>
      ) : activeTab === 0 ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Posted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Stack spacing={1} alignItems="center">
                      <WorkIcon sx={{ color: '#cbd5e1' }} />
                      <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>No active job postings.</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Post a role to start building the pipeline.</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{job.title}</TableCell>
                    <TableCell>{job.location || 'Remote'}</TableCell>
                    <TableCell>{job.employment_type || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={job.status} size="small" sx={{ bgcolor: job.status === 'Open' ? '#dcfce7' : '#f3f4f6', color: job.status === 'Open' ? '#166534' : '#4b5563', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : activeTab === 1 ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Stack spacing={1} alignItems="center">
                      <PeopleIcon sx={{ color: '#cbd5e1' }} />
                      <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>No candidates in the pool yet.</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Import a profile or create the first candidate card.</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{candidate.first_name} {candidate.last_name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.phone || 'N/A'}</TableCell>
                    <TableCell>{candidate.source || 'Direct'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                        {(candidate.parsed_skills || '')
                          .split(',')
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <Chip key={skill} label={skill} size="small" variant="outlined" />
                          ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : activeTab === 2 ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Application</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Job</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Stack spacing={1} alignItems="center">
                      <AssignmentIndIcon sx={{ color: '#cbd5e1' }} />
                      <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>No applications yet.</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Connect a candidate to a job to start tracking progress.</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{application.id.slice(0, 8)}</TableCell>
                    <TableCell>{jobMap.get(application.job_id)?.title || application.job_id}</TableCell>
                    <TableCell>{candidateMap.get(application.candidate_id)?.first_name ? `${candidateMap.get(application.candidate_id)?.first_name} ${candidateMap.get(application.candidate_id)?.last_name}` : application.candidate_id}</TableCell>
                    <TableCell>
                      <Chip label={application.status} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{formatDateTime(application.applied_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Interview</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Application</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Scheduled</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Stack spacing={1} alignItems="center">
                      <EventNoteIcon sx={{ color: '#cbd5e1' }} />
                      <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>No interviews scheduled.</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Once interviews are booked, they’ll show up here.</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                interviews.map((interview) => (
                  <TableRow key={interview.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{interview.id.slice(0, 8)}</TableCell>
                    <TableCell>{applicationMap.get(interview.application_id)?.id.slice(0, 8) || interview.application_id}</TableCell>
                    <TableCell>{formatDateTime(interview.scheduled_at)}</TableCell>
                    <TableCell>
                      <Chip label={interview.status} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{interview.rating ?? 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={openJobModal} onClose={() => setOpenJobModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Post a New Job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Job Title" fullWidth value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
            <TextField label="Location" fullWidth value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote" />
            <TextField label="Employment Type" fullWidth value={jobForm.employment_type} onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })} />
            <TextField label="Status" fullWidth select value={jobForm.status} onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>
            <TextField label="Job Description" fullWidth multiline rows={4} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
            <TextField label="Requirements" fullWidth multiline rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenJobModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={createJob} sx={{ bgcolor: '#7c3aed', textTransform: 'none' }} disabled={!jobForm.title || !jobForm.description}>
            Create Job
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCandidateModal} onClose={() => setOpenCandidateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Candidate</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="First name" fullWidth value={candidateForm.first_name} onChange={(e) => setCandidateForm({ ...candidateForm, first_name: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Last name" fullWidth value={candidateForm.last_name} onChange={(e) => setCandidateForm({ ...candidateForm, last_name: e.target.value })} />
              </Grid>
            </Grid>
            <TextField label="Email" fullWidth value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })} />
            <TextField label="Phone" fullWidth value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })} />
            <TextField label="Source" fullWidth value={candidateForm.source} onChange={(e) => setCandidateForm({ ...candidateForm, source: e.target.value })} />
            <TextField
              label="Resume text"
              fullWidth
              multiline
              rows={6}
              value={candidateForm.resume_text}
              onChange={(e) => setCandidateForm({ ...candidateForm, resume_text: e.target.value })}
              helperText="Paste resume text here to auto-extract skills before saving."
            />
            {candidateSkills.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {candidateSkills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" />
                ))}
              </Stack>
            )}
            <Button variant="outlined" onClick={parseResume} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Parse resume text
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCandidateModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={createCandidate} sx={{ bgcolor: '#0f172a', textTransform: 'none' }} disabled={!candidateForm.first_name || !candidateForm.last_name || !candidateForm.email}>
            Save Candidate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openApplicationModal} onClose={() => setOpenApplicationModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Application</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField select fullWidth label="Job" value={applicationForm.job_id} onChange={(e) => setApplicationForm({ ...applicationForm, job_id: e.target.value })}>
              {jobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Candidate" value={applicationForm.candidate_id} onChange={(e) => setApplicationForm({ ...applicationForm, candidate_id: e.target.value })}>
              {candidates.map((candidate) => (
                <MenuItem key={candidate.id} value={candidate.id}>{candidate.first_name} {candidate.last_name}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Status" value={applicationForm.status} onChange={(e) => setApplicationForm({ ...applicationForm, status: e.target.value })}>
              {APPLICATION_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenApplicationModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={createApplication} sx={{ bgcolor: '#6d28d9', textTransform: 'none' }} disabled={!applicationForm.job_id || !applicationForm.candidate_id}>
            Save Application
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openInterviewModal} onClose={() => setOpenInterviewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Schedule Interview</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField select fullWidth label="Application" value={interviewForm.application_id} onChange={(e) => setInterviewForm({ ...interviewForm, application_id: e.target.value })}>
              {applications.map((application) => (
                <MenuItem key={application.id} value={application.id}>{application.id.slice(0, 8)} - {jobMap.get(application.job_id)?.title || application.job_id}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Scheduled at"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={interviewForm.scheduled_at}
              onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })}
            />
            <TextField label="Meeting link" fullWidth value={interviewForm.meeting_link} onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenInterviewModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={createInterview} sx={{ bgcolor: '#7c3aed', textTransform: 'none' }} disabled={!interviewForm.application_id || !interviewForm.scheduled_at}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
