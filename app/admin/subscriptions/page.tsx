'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';
import { useAuth } from '@/components/auth/AuthContext';

export default function SubscriptionsAdminPage() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState([] as any[]);
  const [plans, setPlans] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('0');
  const [users, setUsers] = useState<any[]>([]);
  const [assigningUser, setAssigningUser] = useState<string | null>(null);
  const [selectedTenantForUser, setSelectedTenantForUser] = useState<string | null>(null);
  const [selectedTenantForFeatures, setSelectedTenantForFeatures] = useState<string | null>(null);
  const [tenantFeatures, setTenantFeatures] = useState<any[]>([]);
  const [assigningPlanTenant, setAssigningPlanTenant] = useState<string | null>(null);
  const [selectedPlanForTenant, setSelectedPlanForTenant] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([t, p, u]) => {
        setTenants(Array.isArray(t) ? t : []);
        setPlans(Array.isArray(p) ? p : []);
        setUsers(Array.isArray(u) ? u : []);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [token]);

  async function createTenant(ev: React.FormEvent) {
    ev.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTenantName, domain: newTenantDomain || undefined }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setTenants((prev) => [created, ...prev]);
      setNewTenantName('');
      setNewTenantDomain('');
    } catch (e) {
      setError(String(e));
    }
  }

  async function createPlan(ev: React.FormEvent) {
    ev.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newPlanName, price_cents: parseInt(newPlanPrice || '0', 10) }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setPlans((prev) => [created, ...prev]);
      setNewPlanName('');
      setNewPlanPrice('0');
    } catch (e) {
      setError(String(e));
    }
  }

  async function loadUsers() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(String(e));
    }
  }

  async function assignUserTenant(userId: string) {
    if (!token || !selectedTenantForUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/tenant?tenant_id=${selectedTenantForUser}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to assign tenant');
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setAssigningUser(null);
      setSelectedTenantForUser(null);
    } catch (e) {
      setError(String(e));
    }
  }

  async function loadTenantFeatures(tenantId: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/features`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTenantFeatures(Array.isArray(data) ? data : []);
      setSelectedTenantForFeatures(tenantId);
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggleFeature(tenantId: string, feature?: any) {
    if (!token) return;
    try {
      if (!feature) {
        // create a placeholder feature (example: "advanced_attendance")
        const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/features`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ feature_key: 'advanced_attendance', enabled: true }),
        });
        const created = await res.json();
        setTenantFeatures((prev) => [created, ...prev]);
      } else {
        // toggle
        const res = await fetch(`${API_BASE_URL}/admin/tenants/${tenantId}/features/${feature.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ feature_key: feature.feature_key, enabled: !feature.enabled }),
        });
        const updated = await res.json();
        setTenantFeatures((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      }
    } catch (e) {
      setError(String(e));
    }
  }

  async function assignPlanToTenant(tenantId: string) {
    if (!token || !selectedPlanForTenant) return;
    try {
      const res = await fetch(`${API_BASE_URL}/billing/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tenant_id: tenantId, plan_id: selectedPlanForTenant }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const payload = await res.json();
      const { order, razorpay_key_id } = payload;

      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if (typeof window === 'undefined') return reject();
        if ((window as any).Razorpay) return resolve();
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.head.appendChild(s);
      });

      const options = {
        key: razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'GreaterHR',
        description: 'Subscription purchase',
        order_id: order.id,
        handler: function (response: any) {
          // Payment completed — frontend might poll or rely on webhook
          alert('Payment successful. You may need to refresh subscription state.');
        },
        prefill: {
          name: '',
          email: '',
        },
      } as any;

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Subscriptions Admin</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <section className="mt-6">
        <h2 className="text-xl">Create Tenant</h2>
        <form onSubmit={createTenant} className="flex gap-2 items-center mt-2">
          <input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} placeholder="Name" className="border px-2 py-1" />
          <input value={newTenantDomain} onChange={(e) => setNewTenantDomain(e.target.value)} placeholder="Domain (example.com)" className="border px-2 py-1" />
          <button className="bg-blue-600 text-white px-3 py-1">Create</button>
        </form>

        <div className="mt-4">
          <h3 className="font-medium">Tenants</h3>
          <ul className="mt-2">
            {tenants.map((t) => (
              <li key={t.id} className="border p-2 mb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.domain}</div>
                  </div>
                  <div className="text-sm">{t.is_active ? 'Active' : 'Disabled'}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => loadTenantFeatures(t.id)} className="px-2 py-1 bg-gray-200">Manage Features</button>
                  <button onClick={() => setAssigningPlanTenant(t.id)} className="px-2 py-1 bg-blue-200">Assign Plan</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl">Create Plan</h2>
        <form onSubmit={createPlan} className="flex gap-2 items-center mt-2">
          <input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="Name" className="border px-2 py-1" />
          <input value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder="Price cents" className="border px-2 py-1 w-32" />
          <button className="bg-green-600 text-white px-3 py-1">Create</button>
        </form>

        <div className="mt-4">
          <h3 className="font-medium">Plans</h3>
          <ul className="mt-2">
            {plans.map((p) => (
              <li key={p.id} className="border p-2 mb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.description}</div>
                  </div>
                  <div className="text-sm">{(p.price_cents / 100).toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl">Manage Users</h2>
        <div className="mt-2">
          <button onClick={loadUsers} className="px-2 py-1 bg-gray-200">Refresh Users</button>
          <ul className="mt-2">
            {users.map((u) => (
              <li key={u.id} className="border p-2 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{u.full_name} ({u.email})</div>
                    <div className="text-sm text-gray-600">Role: {u.role} — Tenant: {u.tenant?.name ?? u.tenant_id ?? 'None'}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={selectedTenantForUser ?? ''} onChange={(e) => setSelectedTenantForUser(e.target.value)} className="border px-2 py-1">
                      <option value="">Select tenant</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button onClick={() => { setAssigningUser(u.id); setSelectedTenantForUser(u.tenant_id ?? ''); }} className="px-2 py-1 bg-blue-500 text-white">Assign</button>
                    <button onClick={() => assignUserTenant(u.id)} className="px-2 py-1 bg-green-500 text-white">Save</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tenant features panel */}
      {selectedTenantForFeatures && (
        <section className="mt-6">
          <h2 className="text-xl">Tenant Features</h2>
          <div className="mt-2">
            <button onClick={() => toggleFeature(selectedTenantForFeatures, undefined)} className="px-2 py-1 bg-green-500 text-white">Add Example Feature</button>
            <ul className="mt-2">
              {tenantFeatures.map((f) => (
                <li key={f.id} className="border p-2 mb-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{f.feature_key}</div>
                    <div className="text-sm text-gray-600">Enabled: {String(f.enabled)}</div>
                  </div>
                  <div>
                    <button onClick={() => toggleFeature(selectedTenantForFeatures, f)} className="px-2 py-1 bg-yellow-400">Toggle</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Assign plan panel */}
      {assigningPlanTenant && (
        <section className="mt-6">
          <h2 className="text-xl">Assign Plan to Tenant</h2>
          <div className="mt-2 flex gap-2 items-center">
            <select value={selectedPlanForTenant ?? ''} onChange={(e) => setSelectedPlanForTenant(e.target.value)} className="border px-2 py-1">
              <option value="">Choose plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {(p.price_cents/100).toFixed(2)}</option>
              ))}
            </select>
            <button onClick={() => assignPlanToTenant(assigningPlanTenant)} className="px-3 py-1 bg-indigo-600 text-white">Purchase</button>
            <button onClick={() => setAssigningPlanTenant(null)} className="px-3 py-1 bg-gray-300">Close</button>
          </div>
        </section>
      )}
    </div>
  );
}
