'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { usePermissions } from '@/components/auth/usePermissions';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

interface SubscriptionData {
  tenant_name: string;
  domain: string;
  has_active_subscription: boolean;
  subscription: {
    id: string;
    status: string;
    starts_at: string;
    ends_at: string | null;
    price_paid_cents: number;
    plan: {
      id: string;
      name: string;
      billing_cycle: string;
      max_employees: number;
    };
  } | null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const authContext = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState('');

  // Check if user is CEO or Admin
  const isCEO = authContext?.user?.role === 'CEO' || authContext?.user?.role === 'Super Admin' || authContext?.user?.role === 'Admin';

  useEffect(() => {
    const fetchSubscription = async () => {
      if (authContext?.status === 'loading') return;

      if (!authContext?.isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!isCEO) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenants/me/subscription`, {
          headers: {
            Authorization: `Bearer ${authContext.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [authContext?.isAuthenticated, authContext?.status, isCEO, router, authContext?.token]);

  if (authContext?.status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isCEO) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs />
        <Alert severity="warning">You do not have permission to view subscription details.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Workspace Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your current plan, billing, and workspace details.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Workspace Details" />
              <Divider />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
                  <Typography variant="body1" fontWeight={500}>{data.tenant_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Domain</Typography>
                  <Typography variant="body1" fontWeight={500}>{data.domain}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Current Plan" 
                action={
                  data.has_active_subscription ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Inactive" color="error" size="small" />
                  )
                }
              />
              <Divider />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.has_active_subscription && data.subscription ? (
                  <>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Plan Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{data.subscription.plan.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Billing Cycle</Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                        {data.subscription.plan.billing_cycle}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        ₹{(data.subscription.price_paid_cents / 100).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Max Employees</Typography>
                      <Typography variant="body1" fontWeight={500}>{data.subscription.plan.max_employees}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Starts At</Typography>
                      <Typography variant="body1" fontWeight={500}>{new Date(data.subscription.starts_at).toLocaleDateString()}</Typography>
                    </Box>
                  </>
                ) : (
                  <Box py={2}>
                    <Typography color="text.secondary" mb={2}>No active subscription found.</Typography>
                    <Button variant="contained" color="primary">View Plans</Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
