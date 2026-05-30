'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExtensionIcon from '@mui/icons-material/Extension';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

type FeatureOption = {
  key: string;
  name: string;
  description?: string;
  price_cents: number;
  included?: boolean;
};

type CustomPackage = {
  id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  feature_keys: string[];
  created_at: string;
};

type Plan = {
  id: string;
  name: string;
  price_cents: number;
  billing_period: string;
  description?: string | null;
  is_active: boolean;
};

function formatMoney(cents: number | undefined) {
  if (cents == null) return '₹0.00';
  return `₹${(cents / 100).toFixed(2)}`;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`package-tabpanel-${index}`}
      aria-labelledby={`package-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPackageManagerPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [tabIndex, setTabIndex] = useState(0);

  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([]);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPlanFeatures, setSelectedPlanFeatures] = useState<string[]>([]);

  // Dialog States
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageFeatures, setPackageFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  useEffect(() => {
    if (!selectedPlanId) {
      setSelectedPlanFeatures([]);
      return;
    }
    loadPlanFeatures(selectedPlanId);
  }, [selectedPlanId]);

  const packageTotalPrice = useMemo(() => {
    return Math.round((Number(packagePrice) || 0) * 100);
  }, [packagePrice]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const [packagesRes, plansRes, featureRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/packages`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/features`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!packagesRes.ok || !plansRes.ok || !featureRes.ok) {
        throw new Error('Unable to load package manager data');
      }

      const packagesData = await packagesRes.json();
      const plansData = await plansRes.json();
      const featureData = await featureRes.json();

      setPackages(Array.isArray(packagesData) ? packagesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setFeatureOptions(Array.isArray(featureData) ? featureData : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadPlanFeatures(planId: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/plans/${planId}/features`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Unable to load plan feature bundle');
      const options = await res.json();
      setSelectedPlanFeatures(Array.isArray(options) ? options.filter((option: FeatureOption) => option.included).map((option: FeatureOption) => option.key) : []);
    } catch (err) {
      setError(String(err));
    }
  }

  const showSuccess = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  async function submitPackage(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (!packageName.trim()) {
      setError('Package name is required.');
      return;
    }
    if (packageFeatures.length === 0) {
      setError('Select at least one feature.');
      return;
    }
    setError(null);

    try {
      const payload = {
        name: packageName.trim(),
        description: packageDescription.trim() || undefined,
        price_cents: packageTotalPrice,
        feature_keys: packageFeatures,
      };
      const url = editingPackageId ? `${API_BASE_URL}/admin/packages/${editingPackageId}` : `${API_BASE_URL}/admin/packages`;
      const method = editingPackageId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to ${editingPackageId ? 'update' : 'create'} package`);
      
      await loadData();
      setPackageDialogOpen(false);
      resetPackageForm();
      showSuccess(`Package ${editingPackageId ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      setError(String(err));
    }
  }

  function resetPackageForm() {
    setEditingPackageId(null);
    setPackageName('');
    setPackageDescription('');
    setPackagePrice('');
    setPackageFeatures([]);
  }

  function openCreateDialog() {
    resetPackageForm();
    setPackageDialogOpen(true);
  }

  function startEditPackage(pkg: CustomPackage) {
    setEditingPackageId(pkg.id);
    setPackageName(pkg.name);
    setPackageDescription(pkg.description ?? '');
    setPackagePrice((pkg.price_cents / 100).toString());
    setPackageFeatures([...pkg.feature_keys]);
    setPackageDialogOpen(true);
  }

  async function deletePackage(packageId: string) {
    if (!token) return;
    if (!confirm('Delete this custom package? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete package');
      await loadData();
      showSuccess('Package deleted successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function savePlanFeatureBundle() {
    if (!token || !selectedPlanId) return;
    if (selectedPlanFeatures.length === 0) {
      setError('Select at least one feature for the plan bundle.');
      return;
    }
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/plans/${selectedPlanId}/features/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_keys: selectedPlanFeatures }),
      });
      if (!res.ok) throw new Error('Failed to save plan feature bundle');
      await loadPlanFeatures(selectedPlanId);
      showSuccess('Plan feature bundle saved successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Package Management' }]} />
      
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Package & Features Manager
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Create custom packages and define which feature modules are bundled with your primary subscription plans.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {statusMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setStatusMessage(null)}>{statusMessage}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} aria-label="package manager tabs">
          <Tab label="Custom Packages Directory" icon={<ExtensionIcon />} iconPosition="start" />
          <Tab label="Plan Features Manager" icon={<LibraryAddCheckIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading && packages.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* TAB 0: CUSTOM PACKAGES DIRECTORY */}
          <CustomTabPanel value={tabIndex} index={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">All Custom Packages</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDialog}
              >
                Create Custom Package
              </Button>
            </Stack>

            <Grid container spacing={3}>
              {packages.length === 0 && (
                <Grid item xs={12}>
                  <Card><CardContent><Typography color="text.secondary">No custom packages found.</Typography></CardContent></Card>
                </Grid>
              )}
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader 
                      title={pkg.name}
                      subheader={pkg.description || 'No description provided.'}
                      action={
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => startEditPackage(pkg)} color="primary">
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deletePackage(pkg.id)} color="error">
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                        {formatMoney(pkg.price_cents)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">Includes Features:</Typography>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
                        {pkg.feature_keys.map(key => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CustomTabPanel>

          {/* TAB 1: PLAN FEATURES MANAGER */}
          <CustomTabPanel value={tabIndex} index={1}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', maxWidth: 800 }}>
              <CardHeader title="Define Plan Bundles" subheader="Select a base plan and check which modules are included by default." />
              <Divider />
              <CardContent>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel id="plan-select-label">Select Plan</InputLabel>
                  <Select
                    labelId="plan-select-label"
                    value={selectedPlanId}
                    label="Select Plan"
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                  >
                    <MenuItem value="" disabled>Choose a plan...</MenuItem>
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name} — {plan.billing_period} — {formatMoney(plan.price_cents)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedPlanId ? (
                  <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Included Features</Typography>
                    <Grid container spacing={2}>
                      {featureOptions.map((feature) => (
                        <Grid item xs={12} sm={6} key={feature.key}>
                          <label className="flex cursor-pointer items-start gap-3 rounded border border-slate-200 bg-white p-3 text-sm hover:border-indigo-300">
                            <Checkbox 
                              size="small"
                              checked={selectedPlanFeatures.includes(feature.key)}
                              onChange={(e) => {
                                setSelectedPlanFeatures(prev => {
                                  return e.target.checked 
                                    ? [...prev, feature.key] 
                                    : prev.filter(key => key !== feature.key);
                                });
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="500">{feature.name}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{feature.description}</Typography>
                            </Box>
                          </label>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" color="success" onClick={savePlanFeatureBundle}>
                        Save Plan Bundle
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info">Select a plan from the dropdown above to manage its included features.</Alert>
                )}
              </CardContent>
            </Card>
          </CustomTabPanel>
        </>
      )}

      {/* DIALOGS */}
      <Dialog open={packageDialogOpen} onClose={() => setPackageDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={submitPackage}>
          <DialogTitle>{editingPackageId ? 'Edit Custom Package' : 'Create Custom Package'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField label="Package Name" fullWidth required value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="e.g. Analytics Expansion" />
              <TextField label="Description" fullWidth multiline rows={2} value={packageDescription} onChange={e => setPackageDescription(e.target.value)} />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Package Features</Typography>
                <Grid container spacing={1}>
                  {featureOptions.map(feature => (
                    <Grid item xs={12} sm={6} key={feature.key}>
                      <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-2 text-sm hover:border-indigo-300">
                        <Checkbox 
                          size="small"
                          checked={packageFeatures.includes(feature.key)}
                          onChange={(e) => {
                            setPackageFeatures(prev => {
                              return e.target.checked 
                                ? [...prev, feature.key] 
                                : prev.filter(f => f !== feature.key);
                            });
                          }}
                        />
                        <Typography variant="body2">{feature.name}</Typography>
                      </label>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <TextField 
                label="Price (₹)" 
                type="number" 
                fullWidth 
                required 
                value={packagePrice} 
                onChange={e => setPackagePrice(e.target.value)} 
                helperText={`Saved internally in cents as: ${formatMoney(packageTotalPrice)}`}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPackageDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editingPackageId ? 'Save Changes' : 'Create Package'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
