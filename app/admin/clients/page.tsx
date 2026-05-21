'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

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
  if (cents == null) {
    return '₹0.00';
  }
  return `₹${(cents / 100).toFixed(2)}`;
}

export default function AdminClientsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('0');
  const [newPlanBillingPeriod, setNewPlanBillingPeriod] = useState('monthly');
  const [newPlanDescription, setNewPlanDescription] = useState('');

  const [selectedTenantForSubscription, setSelectedTenantForSubscription] = useState<string | null>(null);
  const [selectedPlanForSubscription, setSelectedPlanForSubscription] = useState<string | null>(null);
  const [selectedFeaturePackageByTenant, setSelectedFeaturePackageByTenant] = useState<Record<string, string[]>>({});
  const [customPackages, setCustomPackages] = useState<FeaturePackage[]>([]);
  const [newCustomPackageName, setNewCustomPackageName] = useState('');
  const [newCustomPackagePrice, setNewCustomPackagePrice] = useState('0');
  const [newCustomPackageFeatures, setNewCustomPackageFeatures] = useState<string[]>([]);

  const featurePackages = React.useMemo(() => [...FEATURE_PACKAGES, ...customPackages], [customPackages]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) {
      return;
    }
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

  async function createTenant(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTenantName.trim(), domain: newTenantDomain.trim() || undefined }),
      });
      if (!res.ok) {
        throw new Error('Failed to create client');
      }
      await loadData();
      setNewTenantName('');
      setNewTenantDomain('');
      setStatusMessage('Client created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function createPlan(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setStatusMessage(null);

    const priceCents = Math.round((Number(newPlanPrice) || 0) * 100);
    if (priceCents <= 0) {
      setError('Enter a valid plan price greater than 0.');
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
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to create plan');
      }
      await loadData();
      setNewPlanName('');
      setNewPlanPrice('0');
      setNewPlanDescription('');
      setStatusMessage('Plan created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  const packageBuilderSuggestedPrice = newCustomPackageFeatures.reduce(
    (sum, featureKey) => sum + (MODULE_PRICE_MAP[featureKey] || 0),
    0,
  );

  async function createCustomPackage(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setStatusMessage(null);

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
      if (!res.ok) {
        throw new Error('Failed to create custom package');
      }
      const createdPackage = await res.json();
      const newPackage: FeaturePackage = {
        value: createdPackage.id,
        label: createdPackage.name,
        description: createdPackage.description || `Custom bundle with ${createdPackage.feature_keys.length} feature(s).`,
        featureKeys: createdPackage.feature_keys,
        price_cents: createdPackage.price_cents,
      };
      setCustomPackages((prev) => [newPackage, ...prev]);
      setNewCustomPackageName('');
      setNewCustomPackagePrice('0');
      setNewCustomPackageFeatures([]);
      setStatusMessage('Custom package created successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  async function assignSubscription(tenantId: string, planId: string) {
    if (!token) return;
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: planId }),
      });
      if (!res.ok) {
        throw new Error('Failed to assign subscription');
      }
      await loadData();
      setStatusMessage('Subscription created successfully.');
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
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/features/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_keys: featureKeys }),
      });
      if (!res.ok) {
        throw new Error('Failed to grant feature access');
      }
      await loadData();
      setStatusMessage(`Feature packages granted (${selectedPackages.map((p) => p.label).join(', ')}); total price ${formatMoney(totalPriceCents)}.`);
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
    <div className="p-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Clients' }]} />
      <h1 className="text-2xl font-semibold">Client & Subscription Management</h1>
      <p className="mt-2 text-sm text-gray-600">Manage client tenant details and assign subscriptions for trial, monthly, 3-month, 6-month, 9-month, and yearly plans.</p>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading data...</p>}
      {error && <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}
      {statusMessage && <div className="mt-6 rounded border border-green-300 bg-green-50 p-3 text-green-700">{statusMessage}</div>}

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create Client</h2>
          <form onSubmit={createTenant} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Client Name</label>
              <input
                value={newTenantName}
                onChange={(event) => setNewTenantName(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Domain</label>
              <input
                value={newTenantDomain}
                onChange={(event) => setNewTenantDomain(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="acme.com"
              />
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Create client</button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create Plan</h2>
          <form onSubmit={createPlan} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Plan Name</label>
              <input
                value={newPlanName}
                onChange={(event) => setNewPlanName(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Basic Monthly"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPlanPrice}
                onChange={(event) => setNewPlanPrice(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="999"
              />
              <p className="mt-1 text-sm text-slate-500">Enter the plan price in rupees; the app saves it as cents.</p>
              <p className="mt-1 text-sm text-slate-700">
                Preview: <strong>{formatMoney(Math.round((Number(newPlanPrice) || 0) * 100))}</strong>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Billing Period</label>
              <select
                value={newPlanBillingPeriod}
                onChange={(event) => setNewPlanBillingPeriod(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {BILLING_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={newPlanDescription}
                onChange={(event) => setNewPlanDescription(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Plan details"
              />
            </div>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">Create plan</button>
          </form>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Build Custom Package</h2>
          <form onSubmit={createCustomPackage} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Package Name</label>
              <input
                value={newCustomPackageName}
                onChange={(event) => setNewCustomPackageName(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="HR Starter Bundle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Package Features</label>
              <div className="mt-2 grid gap-2">
                {AVAILABLE_FEATURE_TYPES.map((feature) => (
                  <label key={feature.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={newCustomPackageFeatures.includes(feature.value)}
                      onChange={(event) => {
                        setNewCustomPackageFeatures((prev) =>
                          event.target.checked ? [...prev, feature.value] : prev.filter((item) => item !== feature.value),
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {feature.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newCustomPackagePrice}
                onChange={(event) => setNewCustomPackagePrice(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="2499"
              />
              <p className="mt-1 text-sm text-slate-500">
                Suggested price: {formatMoney(packageBuilderSuggestedPrice)} based on selected core modules.
              </p>
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Create package</button>
          </form>

          {customPackages.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Saved custom bundles</h3>
              <div className="space-y-2">
                {customPackages.map((pkg) => (
                  <div key={pkg.value} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{pkg.label}</p>
                        <p className="text-slate-600">{pkg.description}</p>
                      </div>
                      <div className="text-slate-700">{formatMoney(pkg.price_cents)}</div>
                    </div>
                    <p className="mt-2 text-slate-500">Includes: {pkg.featureKeys.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Clients</h2>
          <div className="mt-4 space-y-4">
            {tenants.length === 0 && <p className="text-sm text-slate-500">No clients yet. Create one above.</p>}
            {tenants.map((tenant) => {
              const subscription = tenantSubscriptionMap[tenant.id];
              return (
                <div key={tenant.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">{tenant.name}</p>
                      <p className="text-sm text-slate-500">{tenant.domain ?? 'No domain'}</p>
                    </div>
                    <div className="text-sm text-slate-600">{tenant.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {subscription ? (
                      <>
                        <p>
                          <strong>Plan:</strong> {subscription.plan_name} ({subscription.billing_period})
                        </p>
                        <p>
                          <strong>Status:</strong> {subscription.status}
                        </p>
                        <p>
                          <strong>Ends at:</strong> {subscription.ends_at ?? 'Ongoing'}
                        </p>
                        <p>
                          <strong>Paid:</strong> {formatMoney(subscription.price_paid_cents)}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500">No subscription assigned. Choose a plan to enable access.</p>
                    )}
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="block text-sm font-medium text-slate-700">Feature package selection</label>
                      <p className="text-sm text-slate-500">Choose one or more packages. The total price updates automatically.</p>
                      <div className="grid gap-2">
                        {featurePackages.map((option) => {
                          const selectedKeys = selectedFeaturePackageByTenant[tenant.id] ?? [];
                          const checked = selectedKeys.includes(option.value);
                          return (
                            <label key={option.value} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                  setSelectedFeaturePackageByTenant((prev) => {
                                    const current = prev[tenant.id] ?? [];
                                    const next = event.target.checked
                                      ? [...current, option.value]
                                      : current.filter((value) => value !== option.value);
                                    return { ...prev, [tenant.id]: next };
                                  });
                                }}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <div className="font-medium text-slate-800">{option.label}</div>
                                <div className="text-slate-500">{option.description}</div>
                                <div className="mt-1 text-slate-600">Price: {formatMoney(option.price_cents)}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {selectedFeaturePackageByTenant[tenant.id] && selectedFeaturePackageByTenant[tenant.id].length > 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <p className="font-medium text-slate-800">Selected packages</p>
                          <p className="mt-1 text-slate-600">
                            {featurePackages.filter((pkg) => selectedFeaturePackageByTenant[tenant.id].includes(pkg.value))
                              .map((pkg) => pkg.label)
                              .join(', ')}
                          </p>
                          <p className="mt-2 text-slate-500">
                            {featurePackages.filter((pkg) => selectedFeaturePackageByTenant[tenant.id].includes(pkg.value))
                              .map((pkg) => pkg.description)
                              .join(' ')}
                          </p>
                          <p className="mt-2 text-slate-700">
                            <strong>Package count:</strong>{' '}
                            {featurePackages.filter((pkg) => selectedFeaturePackageByTenant[tenant.id].includes(pkg.value)).length}
                          </p>
                          <p className="mt-2 text-slate-700">
                            <strong>Total price:</strong>{' '}
                            {formatMoney(
                              featurePackages.filter((pkg) => selectedFeaturePackageByTenant[tenant.id].includes(pkg.value)).reduce(
                                (sum, item) => sum + item.price_cents,
                                0,
                              ),
                            )}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!selectedFeaturePackageByTenant[tenant.id] || selectedFeaturePackageByTenant[tenant.id].length === 0}
                          onClick={() => assignFeaturePackage(tenant.id)}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Grant selected access
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFeaturePackageByTenant((prev) => ({ ...prev, [tenant.id]: [] }))}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100"
                        >
                          Clear selection
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={selectedTenantForSubscription === tenant.id ? selectedPlanForSubscription ?? '' : ''}
                        onChange={(event) => {
                          setSelectedTenantForSubscription(tenant.id);
                          setSelectedPlanForSubscription(event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="">Select a plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} — {plan.billing_period} — {formatMoney(plan.price_cents)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!selectedTenantForSubscription || !selectedPlanForSubscription || selectedTenantForSubscription !== tenant.id}
                        onClick={() => selectedTenantForSubscription && selectedPlanForSubscription && assignSubscription(tenant.id, selectedPlanForSubscription)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Assign / Renew subscription
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Plans</h2>
          <div className="mt-4 space-y-3">
            {plans.length === 0 && <p className="text-sm text-slate-500">No plans available yet. Create a plan above.</p>}
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold">{plan.name}</p>
                    <p className="text-sm text-slate-500">{plan.description ?? 'No description'}</p>
                  </div>
                  <div className="text-right text-sm text-slate-700">
                    <div>{plan.billing_period}</div>
                    <div className="font-semibold">{formatMoney(plan.price_cents)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
