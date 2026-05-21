'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';
import { useAuth } from '@/components/auth/AuthContext';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

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

export default function AdminPackageManagerPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPlanFeatures, setSelectedPlanFeatures] = useState<string[]>([]);

  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('0');
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
    setStatusMessage(null);

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
      resetPackageForm();
      setStatusMessage(`Package ${editingPackageId ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      setError(String(err));
    }
  }

  function resetPackageForm() {
    setEditingPackageId(null);
    setPackageName('');
    setPackageDescription('');
    setPackagePrice('0');
    setPackageFeatures([]);
  }

  function startEditPackage(pkg: CustomPackage) {
    setEditingPackageId(pkg.id);
    setPackageName(pkg.name);
    setPackageDescription(pkg.description ?? '');
    setPackagePrice((pkg.price_cents / 100).toFixed(2));
    setPackageFeatures([...pkg.feature_keys]);
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
      setStatusMessage('Package deleted successfully.');
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
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/plans/${selectedPlanId}/features/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_keys: selectedPlanFeatures }),
      });
      if (!res.ok) throw new Error('Failed to save plan feature bundle');
      await loadPlanFeatures(selectedPlanId);
      setStatusMessage('Plan feature bundle saved successfully.');
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Package Management' }]} />
      <h1 className="text-2xl font-semibold">Package Management</h1>
      <p className="mt-2 text-sm text-gray-600">Create, edit, delete custom packages and assign feature bundles to subscription plans.</p>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading package manager...</p>}
      {error && <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}
      {statusMessage && <div className="mt-6 rounded border border-green-300 bg-green-50 p-3 text-green-700">{statusMessage}</div>}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create / Edit Custom Package</h2>
          <form onSubmit={submitPackage} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Package Name</label>
              <input
                value={packageName}
                onChange={(event) => setPackageName(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Full HR Suite Bundle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={packageDescription}
                onChange={(event) => setPackageDescription(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Includes attendance, payroll, HR, and document modules."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={packagePrice}
                onChange={(event) => setPackagePrice(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="1299"
              />
              <p className="mt-1 text-sm text-slate-500">Saved in cents as {formatMoney(packageTotalPrice)}.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Package Features</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {featureOptions.map((feature) => (
                  <label key={feature.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={packageFeatures.includes(feature.key)}
                      onChange={(event) => {
                        setPackageFeatures((prev) =>
                          event.target.checked ? [...prev, feature.key] : prev.filter((key) => key !== feature.key),
                        );
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-slate-800">{feature.name}</div>
                      <div className="text-slate-500">{feature.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                {editingPackageId ? 'Update package' : 'Create package'}
              </button>
              {editingPackageId ? (
                <button type="button" onClick={resetPackageForm} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Plan Feature Bundles</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select plan</label>
              <select
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Choose a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.billing_period} — {formatMoney(plan.price_cents)}
                  </option>
                ))}
              </select>
            </div>
            {selectedPlanId ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Toggle the feature modules included in this plan.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {featureOptions.map((feature) => (
                    <label key={feature.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedPlanFeatures.includes(feature.key)}
                        onChange={(event) => {
                          setSelectedPlanFeatures((prev) =>
                            event.target.checked ? [...prev, feature.key] : prev.filter((key) => key !== feature.key),
                          );
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium text-slate-800">{feature.name}</div>
                        <div className="text-slate-500">{feature.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={savePlanFeatureBundle}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Save plan bundle
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Custom Packages</h2>
        <div className="mt-4 grid gap-4">
          {packages.length === 0 ? (
            <p className="text-sm text-slate-500">No custom packages yet.</p>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{pkg.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{pkg.description ?? 'No description provided.'}</p>
                    <p className="mt-2 text-sm text-slate-700">Includes: {pkg.feature_keys.join(', ')}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-800 shadow-sm">{formatMoney(pkg.price_cents)}</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditPackage(pkg)}
                        className="rounded-lg border border-indigo-600 bg-white px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePackage(pkg.id)}
                        className="rounded-lg border border-red-600 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
