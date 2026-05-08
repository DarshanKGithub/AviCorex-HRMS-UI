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
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Offer = {
  id: string;
  employee_id: string;
  candidate_id?: string | null;
  title: string;
  salary_amount: number;
  joining_date?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type Onboarding = {
  id: string;
  employee_id: string;
  probation_end_date?: string | null;
  checklist: string;
  owner_id?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ExitCase = {
  id: string;
  employee_id: string;
  exit_type: string;
  reason?: string | null;
  notice_period_end?: string | null;
  last_working_day?: string | null;
  settlement_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type Asset = {
  id: string;
  asset_tag: string;
  name: string;
  category: string;
  serial_number?: string | null;
  employee_id?: string | null;
  status: string;
  assigned_on?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type Summary = {
  offers: number;
  onboarding: number;
  exits: number;
  assets: number;
};

type StatusTarget = 'offer' | 'onboarding' | 'exit' | 'asset';

const offerStatuses = ['Draft', 'Sent', 'Accepted', 'Declined', 'Withdrawn'];
const onboardingStatuses = ['Initiated', 'In Progress', 'Completed', 'On Hold'];
const exitStatuses = ['Requested', 'In Progress', 'Approved', 'Closed'];
const assetStatuses = ['Available', 'Assigned', 'Repair', 'Retired'];

export default function LifecyclePage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({ offers: 0, onboarding: 0, exits: 0, assets: 0 });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [onboarding, setOnboarding] = useState<Onboarding[]>([]);
  const [exits, setExits] = useState<ExitCase[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
  const [statusId, setStatusId] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const [offerForm, setOfferForm] = useState({ employee_id: '', candidate_id: '', title: '', salary_amount: '', joining_date: '', status: 'Draft', notes: '' });
  const [onboardingForm, setOnboardingForm] = useState({ employee_id: '', probation_end_date: '', checklist: '[]', owner_id: '', status: 'Initiated' });
  const [exitForm, setExitForm] = useState({ employee_id: '', exit_type: 'Resignation', reason: '', notice_period_end: '', last_working_day: '', settlement_amount: '', status: 'Requested' });
  const [assetForm, setAssetForm] = useState({ asset_tag: '', name: '', category: 'IT Equipment', serial_number: '', employee_id: '', status: 'Available', notes: '' });

  const canManageOffers = ['Admin', 'HR'].includes(user?.role || '');
  const canManageOnboarding = ['Admin', 'HR'].includes(user?.role || '');
  const canManageExits = ['Admin', 'HR'].includes(user?.role || '');
  const canManageAssets = ['Admin', 'HR'].includes(user?.role || '');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const summaryCards = useMemo(() => [
    { label: 'Offers', value: summary.offers, icon: BadgeIcon, color: '#dbeafe' },
    { label: 'Onboarding', value: summary.onboarding, icon: AssignmentTurnedInIcon, color: '#dcfce7' },
    { label: 'Exits', value: summary.exits, icon: ExitToAppIcon, color: '#fee2e2' },
    { label: 'Assets', value: summary.assets, icon: Inventory2Icon, color: '#ede9fe' },
  ], [summary]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, offersRes, onboardingRes, exitsRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE}/lifecycle/summary`, { headers }),
        fetch(`${API_BASE}/lifecycle/offers`, { headers }),
        fetch(`${API_BASE}/lifecycle/onboarding`, { headers }),
        fetch(`${API_BASE}/lifecycle/exits`, { headers }),
        fetch(`${API_BASE}/lifecycle/assets`, { headers }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (onboardingRes.ok) setOnboarding(await onboardingRes.json());
      if (exitsRes.ok) setExits(await exitsRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
    } catch {
      setError('Unable to load lifecycle data right now.');
    } finally {
      setLoading(false);
    }
  }

  async function createRecord(path: string, payload: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.detail || 'Request failed');
    }
  }

  async function submitOffer() {
    setError(null);
    try {
      await createRecord('/lifecycle/offers', {
        ...offerForm,
        candidate_id: offerForm.candidate_id || null,
        salary_amount: Number(offerForm.salary_amount),
        joining_date: offerForm.joining_date || null,
        notes: offerForm.notes || null,
      });
      setOfferForm({ employee_id: '', candidate_id: '', title: '', salary_amount: '', joining_date: '', status: 'Draft', notes: '' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
    }
  }

  async function submitOnboarding() {
    setError(null);
    try {
      await createRecord('/lifecycle/onboarding', {
        employee_id: onboardingForm.employee_id,
        probation_end_date: onboardingForm.probation_end_date || null,
        checklist: onboardingForm.checklist,
        owner_id: onboardingForm.owner_id || null,
        status: onboardingForm.status,
      });
      setOnboardingForm({ employee_id: '', probation_end_date: '', checklist: '[]', owner_id: '', status: 'Initiated' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create onboarding plan');
    }
  }

  async function submitExit() {
    setError(null);
    try {
      await createRecord('/lifecycle/exits', {
        employee_id: exitForm.employee_id,
        exit_type: exitForm.exit_type,
        reason: exitForm.reason || null,
        notice_period_end: exitForm.notice_period_end || null,
        last_working_day: exitForm.last_working_day || null,
        settlement_amount: Number(exitForm.settlement_amount || 0),
        status: exitForm.status,
      });
      setExitForm({ employee_id: '', exit_type: 'Resignation', reason: '', notice_period_end: '', last_working_day: '', settlement_amount: '', status: 'Requested' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exit case');
    }
  }

  async function submitAsset() {
    setError(null);
    try {
      await createRecord('/lifecycle/assets', {
        asset_tag: assetForm.asset_tag,
        name: assetForm.name,
        category: assetForm.category,
        serial_number: assetForm.serial_number || null,
        employee_id: assetForm.employee_id || null,
        status: assetForm.status,
        notes: assetForm.notes || null,
      });
      setAssetForm({ asset_tag: '', name: '', category: 'IT Equipment', serial_number: '', employee_id: '', status: 'Available', notes: '' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
    }
  }

  async function updateStatus() {
    if (!statusTarget || !statusId || !statusValue) return;
    setError(null);
    try {
      const endpoint =
        statusTarget === 'offer'
          ? `/lifecycle/offers/${statusId}`
          : statusTarget === 'onboarding'
          ? `/lifecycle/onboarding/${statusId}`
          : statusTarget === 'exit'
          ? `/lifecycle/exits/${statusId}`
          : `/lifecycle/assets/${statusId}`;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusValue }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || 'Unable to update status');
      }

      setStatusTarget(null);
      setStatusId('');
      setStatusValue('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    }
  }

  function openStatusDialog(target: StatusTarget, id: string, currentStatus: string) {
    setStatusTarget(target);
    setStatusId(id);
    setStatusValue(currentStatus);
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumbs />

      <Stack spacing={3}>
        <Box>
          <Chip label="Lifecycle" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }} />
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a' }}>
            Offer, onboarding, exit, and assets
          </Typography>
          <Typography sx={{ color: '#64748b', maxWidth: 840 }}>
            This hub combines the main post-hire HR workflows into one place so the team can manage the employee lifecycle without jumping between screens.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2.5}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} lg={3} key={card.label}>
                <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>{card.label}</Typography>
                        <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: '#0f172a' }}>{card.value}</Typography>
                      </Box>
                      <Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: card.color }}>
                        <Icon sx={{ color: '#0f172a' }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 260 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={4}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Offer management</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 14 }}>Draft, send, and track offers.</Typography>
                  </Box>
                  <Button component={Link} href="/recruitment" variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>Recruitment</Button>
                </Stack>

                <Grid container spacing={2.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Employee ID" value={offerForm.employee_id} onChange={(e) => setOfferForm({ ...offerForm, employee_id: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Candidate ID" value={offerForm.candidate_id} onChange={(e) => setOfferForm({ ...offerForm, candidate_id: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Offer title" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Salary amount" type="number" value={offerForm.salary_amount} onChange={(e) => setOfferForm({ ...offerForm, salary_amount: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Joining date" type="date" InputLabelProps={{ shrink: true }} value={offerForm.joining_date} onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField select fullWidth label="Status" value={offerForm.status} onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}>
                      {offerStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button fullWidth variant="contained" onClick={submitOffer} disabled={!canManageOffers || !offerForm.employee_id || !offerForm.title} sx={{ height: '100%' }}>
                      Create offer
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={2} label="Notes" value={offerForm.notes} onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })} />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Salary</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>No offers yet.</TableCell></TableRow>
                    ) : offers.map((offer) => (
                      <TableRow key={offer.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{offer.title}</TableCell>
                        <TableCell>{offer.employee_id}</TableCell>
                        <TableCell>{offer.salary_amount}</TableCell>
                        <TableCell><Chip label={offer.status} size="small" /></TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" onClick={() => openStatusDialog('offer', offer.id, offer.status)} sx={{ textTransform: 'none' }}>Change status</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Onboarding and probation</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 14, mb: 2 }}>Track new hire setup and probation progress.</Typography>

                <Grid container spacing={2.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Employee ID" value={onboardingForm.employee_id} onChange={(e) => setOnboardingForm({ ...onboardingForm, employee_id: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Probation end date" type="date" InputLabelProps={{ shrink: true }} value={onboardingForm.probation_end_date} onChange={(e) => setOnboardingForm({ ...onboardingForm, probation_end_date: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Owner ID" value={onboardingForm.owner_id} onChange={(e) => setOnboardingForm({ ...onboardingForm, owner_id: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField select fullWidth label="Status" value={onboardingForm.status} onChange={(e) => setOnboardingForm({ ...onboardingForm, status: e.target.value })}>{onboardingStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={8}><TextField fullWidth label="Checklist JSON" value={onboardingForm.checklist} onChange={(e) => setOnboardingForm({ ...onboardingForm, checklist: e.target.value })} helperText={'Store checklist items as JSON text, e.g. ["Laptop", "Account setup"]'} /></Grid>
                  <Grid item xs={12}><Button variant="contained" onClick={submitOnboarding} disabled={!canManageOnboarding || !onboardingForm.employee_id} sx={{ textTransform: 'none', fontWeight: 700 }}>Create onboarding plan</Button></Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />
                <Table>
                  <TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell sx={{ fontWeight: 700 }}>Probation end</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Actions</TableCell></TableRow></TableHead>
                  <TableBody>
                    {onboarding.length === 0 ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>No onboarding plans yet.</TableCell></TableRow> : onboarding.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.employee_id}</TableCell>
                        <TableCell>{item.probation_end_date || 'N/A'}</TableCell>
                        <TableCell><Chip label={item.status} size="small" /></TableCell>
                        <TableCell><Button size="small" variant="outlined" onClick={() => openStatusDialog('onboarding', item.id, item.status)} sx={{ textTransform: 'none' }}>Change status</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Exit management and full-and-final</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 14, mb: 2 }}>Track resignations, termination, notice periods, and settlements.</Typography>

                <Grid container spacing={2.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Employee ID" value={exitForm.employee_id} onChange={(e) => setExitForm({ ...exitForm, employee_id: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Exit type" value={exitForm.exit_type} onChange={(e) => setExitForm({ ...exitForm, exit_type: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField select fullWidth label="Status" value={exitForm.status} onChange={(e) => setExitForm({ ...exitForm, status: e.target.value })}>{exitStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Notice end" type="date" InputLabelProps={{ shrink: true }} value={exitForm.notice_period_end} onChange={(e) => setExitForm({ ...exitForm, notice_period_end: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Last working day" type="date" InputLabelProps={{ shrink: true }} value={exitForm.last_working_day} onChange={(e) => setExitForm({ ...exitForm, last_working_day: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Settlement amount" type="number" value={exitForm.settlement_amount} onChange={(e) => setExitForm({ ...exitForm, settlement_amount: e.target.value })} /></Grid>
                  <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Reason" value={exitForm.reason} onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })} /></Grid>
                  <Grid item xs={12}><Button variant="contained" onClick={submitExit} disabled={!canManageExits || !exitForm.employee_id || !exitForm.exit_type} sx={{ textTransform: 'none', fontWeight: 700 }}>Create exit case</Button></Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />
                <Table>
                  <TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Actions</TableCell></TableRow></TableHead>
                  <TableBody>
                    {exits.length === 0 ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>No exit cases yet.</TableCell></TableRow> : exits.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.employee_id}</TableCell>
                        <TableCell>{item.exit_type}</TableCell>
                        <TableCell><Chip label={item.status} size="small" /></TableCell>
                        <TableCell><Button size="small" variant="outlined" onClick={() => openStatusDialog('exit', item.id, item.status)} sx={{ textTransform: 'none' }}>Change status</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Asset and inventory</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 14, mb: 2 }}>Track laptops, devices, and assigned equipment.</Typography>

                <Grid container spacing={2.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Asset tag" value={assetForm.asset_tag} onChange={(e) => setAssetForm({ ...assetForm, asset_tag: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Asset name" value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Category" value={assetForm.category} onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Serial number" value={assetForm.serial_number} onChange={(e) => setAssetForm({ ...assetForm, serial_number: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Assigned employee ID" value={assetForm.employee_id} onChange={(e) => setAssetForm({ ...assetForm, employee_id: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={assetForm.status} onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value })}>{assetStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={3}><Button fullWidth variant="contained" onClick={submitAsset} disabled={!canManageAssets || !assetForm.asset_tag || !assetForm.name} sx={{ height: '100%' }}>Add asset</Button></Grid>
                  <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Notes" value={assetForm.notes} onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })} /></Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />
                <Table>
                  <TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Tag</TableCell><TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Assigned to</TableCell><TableCell sx={{ fontWeight: 700 }}>Actions</TableCell></TableRow></TableHead>
                  <TableBody>
                    {assets.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>No assets recorded yet.</TableCell></TableRow> : assets.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.asset_tag}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell><Chip label={item.status} size="small" /></TableCell>
                        <TableCell>{item.employee_id || 'Unassigned'}</TableCell>
                        <TableCell><Button size="small" variant="outlined" onClick={() => openStatusDialog('asset', item.id, item.status)} sx={{ textTransform: 'none' }}>Change status</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        )}

        <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>What this page does</Typography>
            <Typography sx={{ mt: 1, color: '#64748b', lineHeight: 1.8 }}>
              Lifecycle unifies the post-hire HR processes into one working surface. Offers connect hiring to joining, onboarding tracks the probation journey, exits cover settlement and offboarding, and inventory keeps company assets mapped to employees.
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {statusTarget && (
        <Card sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300, width: { xs: 'calc(100% - 48px)', sm: 420 }, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Update status</Typography>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                {(statusTarget === 'offer' ? offerStatuses : statusTarget === 'onboarding' ? onboardingStatuses : statusTarget === 'exit' ? exitStatuses : assetStatuses).map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setStatusTarget(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" onClick={updateStatus} sx={{ textTransform: 'none' }}>Save</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
