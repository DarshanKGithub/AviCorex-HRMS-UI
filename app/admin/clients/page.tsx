'use client';

import React, { useEffect, useState } from 'react';
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
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
  IconButton
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BusinessIcon from '@mui/icons-material/Business';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const BILLING_PERIOD_OPTIONS = [
  { value: 'trial', label: 'Trial (14 days)' },
  { value: 'monthly', label: 'Monthly (30 days)' },
  { value: '3-month', label: '3-Month (90 days)' },
  { value: '6-month', label: '6-Month (180 days)' },
  { value: '9-month', label: '9-Month (270 days)' },
  { value: 'yearly', label: 'Yearly (365 days)' },
];

type FeaturePackage = {
  value: string;
  label: string;
  description: string;
  featureKeys: string[];
  price_cents: number;
};

const FEATURE_PACKAGES: FeaturePackage[] = [
  { value: 'attendance_module', label: 'Attendance Module', description: 'Enable attendance tracking, timesheets and regularization access.', featureKeys: ['attendance_module'], price_cents: 29900 },
  { value: 'payroll_module', label: 'Payroll Module', description: 'Enable payroll, payslips and salary reporting access.', featureKeys: ['payroll_module'], price_cents: 49900 },
  { value: 'employee_module', label: 'Employee Management', description: 'Enable employee directory, org chart and employee lifecycle access.', featureKeys: ['employee_module'], price_cents: 19900 },
  { value: 'document_module', label: 'Document Center', description: 'Enable document upload, approvals and file access.', featureKeys: ['document_module'], price_cents: 14900 },
  { value: 'helpdesk_module', label: 'Helpdesk Module', description: 'Enable support tickets, grievances and gate pass access.', featureKeys: ['helpdesk_module'], price_cents: 15900 },
  { value: 'full_hr_suite', label: 'Full HR Suite', description: 'Enable all feature modules for the tenant.', featureKeys: ['attendance_module', 'payroll_module', 'employee_module', 'document_module', 'helpdesk_module'], price_cents: 129900 },
];

const AVAILABLE_FEATURE_TYPES = [
  { value: 'attendance_module', label: 'Attendance Tracking' },
  { value: 'payroll_module', label: 'Payroll & Payslips' },
  { value: 'employee_module', label: 'Employee Management' },
  { value: 'document_module', label: 'Document Center' },
  { value: 'helpdesk_module', label: 'Helpdesk & Support' },
];

const MODULE_PRICE_MAP: Record<string, number> = Object.fromEntries(
  FEATURE_PACKAGES.filter((pkg) => pkg.featureKeys.length === 1).map((pkg) => [pkg.value, pkg.price_cents]),
);

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

export default function AdminClientsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [tabIndex, setTabIndex] = useState(0);

  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [customPackages, setCustomPackages] = useState<FeaturePackage[]>([]);

  // Dialogs
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);

  // Client Form
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Plan Form
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanBillingPeriod, setNewPlanBillingPeriod] = useState('monthly');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([]);

  // Package Form
  const [newCustomPackageName, setNewCustomPackageName] = useState('');
  const [newCustomPackagePrice, setNewCustomPackagePrice] = useState('');
  const [newCustomPackageFeatures, setNewCustomPackageFeatures] = useState<string[]>([]);

  // Assign Subscription State
  const [selectedTenantForSubscription, setSelectedTenantForSubscription] = useState<string | null>(null);
  const [selectedPlanForSubscription, setSelectedPlanForSubscription] = useState<string>('');

  // Assign Package State
  const [selectedFeaturePackageByTenant, setSelectedFeaturePackageByTenant] = useState<Record<string, string[]>>({});

  const featurePackages = React.useMemo(() => [...FEATURE_PACKAGES, ...customPackages], [customPackages]);

  useEffect(() => {
    if (!token) return;
    
    const verifyPayment = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const sessionId = urlParams.get('session_id');
        
        if (paymentStatus === 'success' && sessionId) {
          try {
            await fetch(`${API_BASE_URL}/admin/subscriptions/verify-payment?session_id=${sessionId}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
            setStatusMessage('Payment successful! The subscription is now active.');
          } catch (e) {
            console.error('Failed to verify payment', e);
          }
        } else if (paymentStatus === 'success') {
          setStatusMessage('Payment successful! The subscription is now active.');
        } else if (paymentStatus === 'cancelled') {
          setError('Payment was cancelled.');
        }
        
        if (paymentStatus) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      loadData();
    };

    verifyPayment();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const [tenantsRes, plansRes, subsRes, packagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/subscriptions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/packages`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!tenantsRes.ok || !plansRes.ok || !subsRes.ok || !packagesRes.ok) {
        throw new Error('Unable to load admin data');
      }

      const tenantsData = await tenantsRes.json();
      const plansData = await plansRes.json();
      const subsData = await subsRes.json();
      const packagesData = await packagesRes.json();

      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setCustomPackages(Array.isArray(packagesData) ? packagesData.map((pkg: any) => ({
        value: pkg.id,
        label: pkg.name,
        description: pkg.description || `Custom bundle with ${pkg.feature_keys.length} feature(s).`,
        featureKeys: pkg.feature_keys,
        price_cents: pkg.price_cents,
      })) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const showSuccess = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  async function createTenant(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: newTenantName.trim(), 
          domain: newTenantDomain.trim() || undefined,
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim(),
          admin_password: adminPassword
        }),
      });
      if (!res.ok) throw new Error('Failed to create client');
      await loadData();
      
      setClientDialogOpen(false);
      setNewTenantName('');
      setNewTenantDomain('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      showSuccess('Client created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function createPlan(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);

    const priceCents = Math.round((Number(newPlanPrice) || 0) * 100);
    if (priceCents <= 0) {
      setError('Enter a valid plan price greater than 0.');
      return;
    }
    if (newPlanFeatures.length === 0) {
      setError('Select at least one feature for the plan.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newPlanName.trim(),
          price_cents: priceCents,
          billing_period: newPlanBillingPeriod,
          description: newPlanDescription.trim() || undefined,
          feature_keys: newPlanFeatures,
        }),
      });
      if (!res.ok) throw new Error('Failed to create plan');
      await loadData();
      
      setPlanDialogOpen(false);
      setNewPlanName('');
      setNewPlanPrice('');
      setNewPlanDescription('');
      setNewPlanFeatures([]);
      showSuccess('Plan created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  const packageBuilderSuggestedPrice = newCustomPackageFeatures.reduce(
    (sum, featureKey) => sum + (MODULE_PRICE_MAP[featureKey] || 0),
    0,
  );

  const planSuggestedPrice = newPlanFeatures.reduce(
    (sum, featureKey) => sum + (MODULE_PRICE_MAP[featureKey] || 0),
    0,
  );

  async function createCustomPackage(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);

    if (!newCustomPackageName.trim()) {
      setError('Provide a package name.');
      return;
    }
    if (newCustomPackageFeatures.length === 0) {
      setError('Select at least one feature for your custom package.');
      return;
    }
    const priceCents = Math.round((Number(newCustomPackagePrice) || 0) * 100);
    if (priceCents <= 0) {
      setError('Enter a valid custom package price greater than 0.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newCustomPackageName.trim(),
          description: `Custom bundle with ${newCustomPackageFeatures.length} feature(s).`,
          price_cents: priceCents,
          feature_keys: newCustomPackageFeatures,
        }),
      });
      if (!res.ok) throw new Error('Failed to create custom package');
      await loadData();
      
      setPackageDialogOpen(false);
      setNewCustomPackageName('');
      setNewCustomPackagePrice('');
      setNewCustomPackageFeatures([]);
      showSuccess('Custom package created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function assignSubscription(tenantId: string, planId: string) {
    if (!token || !planId) return;
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: planId }),
      });
      if (!res.ok) throw new Error('Failed to assign subscription');
      
      const data = await res.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      
      await loadData();
      showSuccess('Subscription assigned successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function assignFeaturePackage(tenantId: string) {
    if (!token) return;
    const selectedPackageKeys = selectedFeaturePackageByTenant[tenantId] ?? [];
    if (selectedPackageKeys.length === 0) {
      setError('Please select at least one feature package before granting access.');
      return;
    }

    const selectedPackages = featurePackages.filter((item) => selectedPackageKeys.includes(item.value));
    const featureKeys = Array.from(new Set(selectedPackages.flatMap((item) => item.featureKeys)));
    const totalPriceCents = selectedPackages.reduce((sum, item) => sum + item.price_cents, 0);

    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/features/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_keys: featureKeys }),
      });
      if (!res.ok) throw new Error('Failed to grant feature access');
      
      await loadData();
      showSuccess(`Feature packages granted. Total price added: ${formatMoney(totalPriceCents)}.`);
    } catch (err) {
      setError(String(err));
    }
  }

  const tenantSubscriptionMap = subscriptions.reduce<Record<string, any>>((acc, subscription) => {
    if (subscription && subscription.tenant_id) {
      acc[subscription.tenant_id] = subscription;
    }
    return acc;
  }, {});

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Clients' }]} />
      
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Client & Subscription Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage your SaaS clients, define billing tiers, and assemble custom feature packages.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {statusMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setStatusMessage(null)}>{statusMessage}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} aria-label="admin tabs">
          <Tab label="Clients Directory" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Subscription Plans" icon={<ViewModuleIcon />} iconPosition="start" />
          <Tab label="Custom Packages" icon={<SettingsSuggestIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading && tenants.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* TAB 1: CLIENTS DIRECTORY */}
          <CustomTabPanel value={tabIndex} index={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">All Clients</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddRoundedIcon />}
                onClick={() => setClientDialogOpen(true)}
              >
                Create Client
              </Button>
            </Stack>

            <Grid container spacing={3}>
              {tenants.length === 0 && (
                <Grid item xs={12}>
                  <Card><CardContent><Typography color="text.secondary">No clients found.</Typography></CardContent></Card>
                </Grid>
              )}
              {tenants.map((tenant) => {
                const subscription = tenantSubscriptionMap[tenant.id];
                return (
                  <Grid item xs={12} lg={6} key={tenant.id}>
                    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', height: '100%' }}>
                      <CardHeader 
                        title={tenant.name}
                        subheader={tenant.domain || 'No domain'}
                        action={<Chip label={tenant.is_active ? 'Active' : 'Inactive'} color={tenant.is_active ? 'success' : 'default'} size="small" />}
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Current Subscription</Typography>
                        {subscription ? (
                          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1, mb: 3 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Plan</Typography><Typography variant="body2" fontWeight="500">{subscription.plan_name}</Typography></Grid>
                              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Billing</Typography><Typography variant="body2" fontWeight="500" sx={{ textTransform: 'capitalize' }}>{subscription.billing_period}</Typography></Grid>
                              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Status</Typography><Typography variant="body2" fontWeight="500" sx={{ textTransform: 'capitalize' }}>{subscription.status}</Typography></Grid>
                              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Price Paid</Typography><Typography variant="body2" fontWeight="500">{formatMoney(subscription.price_paid_cents)}</Typography></Grid>
                            </Grid>
                          </Box>
                        ) : (
                          <Alert severity="info" sx={{ mb: 3, py: 0 }}>No active subscription. Assign a plan below.</Alert>
                        )}

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Assign Base Plan</Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                          <FormControl fullWidth size="small">
                            <Select
                              displayEmpty
                              value={selectedTenantForSubscription === tenant.id ? selectedPlanForSubscription : ''}
                              onChange={(e) => {
                                setSelectedTenantForSubscription(tenant.id);
                                setSelectedPlanForSubscription(e.target.value);
                              }}
                            >
                              <MenuItem value="" disabled>Select a plan...</MenuItem>
                              {plans.map((plan) => (
                                <MenuItem key={plan.id} value={plan.id}>
                                  {plan.name} — {formatMoney(plan.price_cents)}/{plan.billing_period}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button 
                            variant="outlined"
                            disabled={!selectedTenantForSubscription || selectedTenantForSubscription !== tenant.id || !selectedPlanForSubscription}
                            onClick={() => assignSubscription(tenant.id, selectedPlanForSubscription)}
                          >
                            Assign
                          </Button>
                        </Stack>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Assign Add-on Packages</Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <Select
                            multiple
                            displayEmpty
                            value={selectedFeaturePackageByTenant[tenant.id] || []}
                            onChange={(e) => {
                              setSelectedFeaturePackageByTenant(prev => ({
                                ...prev,
                                [tenant.id]: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                              }));
                            }}
                            renderValue={(selected) => {
                              if (selected.length === 0) return <Typography color="text.secondary">Select packages...</Typography>;
                              return selected.map(val => featurePackages.find(p => p.value === val)?.label).join(', ');
                            }}
                          >
                            {featurePackages.map((pkg) => (
                              <MenuItem key={pkg.value} value={pkg.value}>
                                <Checkbox checked={(selectedFeaturePackageByTenant[tenant.id] || []).includes(pkg.value)} />
                                <ListItemText primary={pkg.label} secondary={formatMoney(pkg.price_cents)} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button 
                          variant="outlined"
                          disabled={!(selectedFeaturePackageByTenant[tenant.id]?.length > 0)}
                          onClick={() => assignFeaturePackage(tenant.id)}
                        >
                          Grant Package Access
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CustomTabPanel>

          {/* TAB 2: SUBSCRIPTION PLANS */}
          <CustomTabPanel value={tabIndex} index={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">Subscription Plans</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddRoundedIcon />}
                onClick={() => setPlanDialogOpen(true)}
              >
                Create Plan
              </Button>
            </Stack>

            <Grid container spacing={3}>
              {plans.length === 0 && (
                <Grid item xs={12}>
                  <Card><CardContent><Typography color="text.secondary">No plans available. Create one to get started.</Typography></CardContent></Card>
                </Grid>
              )}
              {plans.map((plan) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader 
                      title={plan.name}
                      subheader={plan.description || 'No description provided.'}
                    />
                    <Divider />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {formatMoney(plan.price_cents)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', mb: 2 }}>
                        Per {plan.billing_period}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CustomTabPanel>

          {/* TAB 3: CUSTOM PACKAGES */}
          <CustomTabPanel value={tabIndex} index={2}>
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="bold">Why Build Custom Packages?</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                While "Plans" dictate a client's core subscription tier, "Custom Packages" act as modular add-ons. 
                They allow you to bundle specific modules together (e.g., a "Payroll + Timesheets Bundle") and upsell them to clients who may be on a basic plan but require extra features, without forcing them into a higher generalized tier.
              </Typography>
            </Alert>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">Standard & Custom Packages</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddRoundedIcon />}
                onClick={() => setPackageDialogOpen(true)}
              >
                Build Custom Package
              </Button>
            </Stack>

            <Grid container spacing={3}>
              {featurePackages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.value}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader 
                      title={pkg.label}
                      subheader={pkg.description}
                      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                    />
                    <Divider />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        {formatMoney(pkg.price_cents)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">Includes Features:</Typography>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
                        {pkg.featureKeys.map(key => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CustomTabPanel>
        </>
      )}

      {/* DIALOGS */}

      {/* Create Client Dialog */}
      <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={createTenant}>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField label="Client Company Name" fullWidth required value={newTenantName} onChange={e => setNewTenantName(e.target.value)} />
              <TextField label="Domain" fullWidth value={newTenantDomain} onChange={e => setNewTenantDomain(e.target.value)} helperText="e.g. acme.com (Optional)" />
              <Divider><Chip label="Admin User Details" size="small" /></Divider>
              <TextField label="Admin Name" fullWidth required value={adminName} onChange={e => setAdminName(e.target.value)} />
              <TextField label="Admin Email" type="email" fullWidth required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
              <TextField label="Admin Password" type="password" fullWidth required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Client</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={createPlan}>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField label="Plan Name" fullWidth required value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="e.g. Starter Monthly" />
              <FormControl fullWidth>
                <InputLabel id="billing-period-label">Billing Period</InputLabel>
                <Select labelId="billing-period-label" label="Billing Period" value={newPlanBillingPeriod} onChange={e => setNewPlanBillingPeriod(e.target.value)}>
                  {BILLING_PERIOD_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Description" fullWidth multiline rows={2} value={newPlanDescription} onChange={e => setNewPlanDescription(e.target.value)} />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Base Plan Features</Typography>
                <Grid container spacing={1}>
                  {AVAILABLE_FEATURE_TYPES.map(feature => (
                    <Grid item xs={12} sm={6} key={feature.value}>
                      <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-2 text-sm">
                        <Checkbox 
                          size="small"
                          checked={newPlanFeatures.includes(feature.value)}
                          onChange={(e) => {
                            setNewPlanFeatures(prev => {
                              const next = e.target.checked ? [...prev, feature.value] : prev.filter(f => f !== feature.value);
                              const price = next.reduce((sum, key) => sum + (MODULE_PRICE_MAP[key] || 0), 0);
                              setNewPlanPrice((price / 100).toString());
                              return next;
                            });
                          }}
                        />
                        {feature.label}
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
                value={newPlanPrice} 
                onChange={e => setNewPlanPrice(e.target.value)} 
                helperText={`Suggested price based on features: ${formatMoney(planSuggestedPrice)}`}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Plan</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Custom Package Dialog */}
      <Dialog open={packageDialogOpen} onClose={() => setPackageDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={createCustomPackage}>
          <DialogTitle>Build Custom Feature Package</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField label="Package Name" fullWidth required value={newCustomPackageName} onChange={e => setNewCustomPackageName(e.target.value)} placeholder="e.g. HR Expansion Pack" />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Included Features</Typography>
                <Grid container spacing={1}>
                  {AVAILABLE_FEATURE_TYPES.map(feature => (
                    <Grid item xs={12} sm={6} key={feature.value}>
                      <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-2 text-sm">
                        <Checkbox 
                          size="small"
                          checked={newCustomPackageFeatures.includes(feature.value)}
                          onChange={(e) => {
                            setNewCustomPackageFeatures(prev => {
                              const next = e.target.checked ? [...prev, feature.value] : prev.filter(f => f !== feature.value);
                              const price = next.reduce((sum, key) => sum + (MODULE_PRICE_MAP[key] || 0), 0);
                              setNewCustomPackagePrice((price / 100).toString());
                              return next;
                            });
                          }}
                        />
                        {feature.label}
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
                value={newCustomPackagePrice} 
                onChange={e => setNewCustomPackagePrice(e.target.value)} 
                helperText={`Suggested price based on core modules: ${formatMoney(packageBuilderSuggestedPrice)}`}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPackageDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Package</Button>
          </DialogActions>
        </form>
      </Dialog>

    </Container>
  );
}
