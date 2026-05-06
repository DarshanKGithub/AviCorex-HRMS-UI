'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';

export default function AttendanceInfoPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#15162c' }}>
          {tab === 0 ? 'Attendance Info' : 'Attendance Info / My Regularizations'}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#3b82f6', 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            px: 3 
          }}
        >
          My Regularizations
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Attendance Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="My Regularizations" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', mb: 1 }}>Avg. Work Hrs</Typography>
                  <Typography sx={{ fontWeight: 600 }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', mb: 1 }}>Avg. Actual Work Hrs</Typography>
                  <Typography sx={{ fontWeight: 600 }}>-</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', mb: 1 }}>Penalty Days</Typography>
                  <Typography sx={{ fontWeight: 600 }}>0</Typography>
                </CardContent>
              </Card>
            </Stack>

            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#6b7280' }}>{'<'} Prev</Typography>
                  <Typography sx={{ fontWeight: 600 }}>May 2026</Typography>
                  <Typography sx={{ color: '#6b7280' }}>Next {'>'}</Typography>
                </Stack>
                {/* Mock Calendar Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', mb: 1 }}>
                  <Box>Sun</Box><Box>Mon</Box><Box>Tue</Box><Box>Wed</Box><Box>Thu</Box><Box>Fri</Box><Box>Sat</Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Box key={i} sx={{ border: '1px solid #e5e7eb', height: 80, borderRadius: 1, p: 1, position: 'relative' }}>
                      <Typography sx={{ fontSize: '0.85rem' }}>{((i + 26) % 31) + 1}</Typography>
                      {i === 7 && <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, borderRadius: '50%', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>0</Box>}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mb: 2 }}>03 Sun</Typography>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>General(GEN)</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mb: 3 }}>Shift : 09:00 to 18:00</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>First In</Typography>
                    <Typography>-</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>Last Out</Typography>
                    <Typography>-</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
           <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                          <Typography sx={{ color: '#6b7280' }}>{'<'} Prev</Typography>
                          <Typography sx={{ fontWeight: 600 }}>MAY 2026</Typography>
                          <Typography sx={{ color: '#6b7280' }}>Next {'>'}</Typography>
                      </Stack>
                      <Box sx={{ bgcolor: '#f3f4f6', p: 2, textAlign: 'center', borderRadius: 1 }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>No exception days to regularise.</Typography>
                      </Box>
                  </CardContent>
              </Card>
           </Grid>
           <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Stack direction="row" spacing={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
                      <Button variant="contained" sx={{ bgcolor: '#3b82f6', borderRadius: 0, textTransform: 'none' }}>Apply</Button>
                      <Button variant="text" sx={{ borderRadius: 0, textTransform: 'none', color: '#6b7280' }}>Pending</Button>
                      <Button variant="text" sx={{ borderRadius: 0, textTransform: 'none', color: '#6b7280' }}>History</Button>
                  </Stack>
              </Box>
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none', py: 8 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                      <Typography sx={{ color: '#6b7280', mb: 1 }}>Smart! Your attendance is sorted.</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af' }}>Still want to apply regularization? Select date(s).</Typography>
                  </CardContent>
              </Card>
           </Grid>
        </Grid>
      )}
    </Box>
  );
}
