'use client';

import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useDashboard } from './DashboardContext';

export function DashboardNavigation() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentSpace, setCurrentSpace, currentSection, setCurrentSection } = useDashboard();

  const panelBorder = isDark ? alpha('#a855f7', 0.2) : '#e2e8f0';

  const spaceTabs = [
    { value: 'my-space', label: 'My Space', icon: '👤' },
    { value: 'organization', label: 'Organization', icon: '🏢' },
  ];

  const sectionTabs = [
    { value: 'overview', label: 'Overview', icon: '📊' },
    { value: 'dashboard', label: 'Dashboard', icon: '📈' },
    { value: 'calendar', label: 'Calendar', icon: '📅' },
    { value: 'delegation', label: 'Delegation', icon: '✅' },
    { value: 'activities', label: 'Activities', icon: '📢' },
  ];

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        mb: 2,
        border: `1px solid ${panelBorder}`,
        background: isDark
          ? 'linear-gradient(120deg, #000000 0%, #09090b 45%, #18181b 100%)'
          : '#ffffff',
      }}
    >
      {/* Space Tabs */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 1.5, pb: 0.9, borderBottom: `1px solid ${alpha('#ffffff', 0.1)}` }}>
        <Stack direction="row" spacing={3.5} sx={{ mb: 1.2 }}>
          {spaceTabs.map((tab, i) => (
            <Box
              key={tab.value}
              onClick={() => setCurrentSpace(tab.value as 'my-space' | 'organization')}
              sx={{
                cursor: 'pointer',
                borderBottom:
                  currentSpace === tab.value
                    ? isDark
                      ? '2px solid #a855f7'
                      : '2px solid #7C3AED'
                    : '2px solid transparent',
                pb: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: currentSpace === tab.value ? 800 : 600,
                  color:
                    currentSpace === tab.value
                      ? isDark
                        ? '#ffffff'
                        : '#000000'
                      : isDark
                        ? alpha('#ffffff', 0.72)
                        : alpha('#000000', 0.6),
                  fontSize: 15,
                }}
              >
                {tab.icon} {tab.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Section Tabs */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {sectionTabs.map((tab, i) => (
            <Chip
              key={tab.value}
              label={`${tab.icon} ${tab.label}`}
              onClick={() => setCurrentSection(tab.value as any)}
              sx={{
                bgcolor:
                  currentSection === tab.value
                    ? alpha('#8b5cf6', 0.2)
                    : alpha('#ffffff', isDark ? 0.06 : 0.4),
                color:
                  currentSection === tab.value
                    ? isDark
                      ? '#c4b5fd'
                      : '#7C3AED'
                    : isDark
                      ? alpha('#ffffff', 0.86)
                      : alpha('#000000', 0.7),
                border: `1px solid ${
                  currentSection === tab.value
                    ? alpha('#a855f7', 0.5)
                    : isDark
                      ? alpha('#ffffff', 0.14)
                      : alpha('#000000', 0.1)
                }`,
                cursor: 'pointer',
                fontWeight: currentSection === tab.value ? 700 : 500,
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
