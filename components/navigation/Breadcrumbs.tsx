'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  sx?: any;
}

const pathBreadcrumbMap: Record<string, { label: string; href?: string }[]> = {
  '/dashboard': [{ label: 'Dashboard', href: '/dashboard' }],
  '/employees': [{ label: 'Employees', href: '/employees' }],
  '/employees/[id]': [
    { label: 'Employees', href: '/employees' },
    { label: 'Employee Details' },
  ],
  '/organization/hierarchy': [
    { label: 'Organization' },
    { label: 'Hierarchy', href: '/organization/hierarchy' }
  ],
  '/recruitment': [{ label: 'Recruitment & ATS', href: '/recruitment' }],
  '/lifecycle': [{ label: 'Lifecycle', href: '/lifecycle' }],
  '/documents': [{ label: 'Document Center', href: '/documents' }],
  '/attendance': [{ label: 'Attendance', href: '/attendance' }],
  '/attendance/timesheets': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Timesheets' },
  ],
  '/attendance/overtime': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Overtime' },
  ],
  '/attendance/comp-off': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Comp-Off' },
  ],
  '/attendance/info': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Regularization' },
  ],
  '/attendance/shifts': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Shifts' },
  ],
  '/attendance/rosters': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Shift Roster' },
  ],
  '/attendance/biometrics': [
    { label: 'Attendance', href: '/attendance' },
    { label: 'Biometrics & Devices' },
  ],
  '/leaves': [{ label: 'Leaves', href: '/leaves' }],
  '/leaves/balances': [
    { label: 'Leaves', href: '/leaves' },
    { label: 'Leave Balances' },
  ],
  '/leaves/holidays': [
    { label: 'Leaves', href: '/leaves' },
    { label: 'Holiday Calendar' },
  ],
  '/payroll': [{ label: 'Payroll', href: '/payroll' }],
  '/payroll/financials': [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Compensation & Claims', href: '/payroll/financials' },
  ],
  '/payroll/payslips': [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Payslips' },
  ],
  '/helpdesk': [{ label: 'Support Tickets', href: '/helpdesk' }],
  '/announcements': [
    { label: 'Helpdesk', href: '/helpdesk' },
    { label: 'Announcements' },
  ],
  '/engage': [{ label: 'Engage', href: '/engage' }],
  '/gate-pass': [
    { label: 'Helpdesk', href: '/helpdesk' },
    { label: 'Gate Pass' },
  ],
  '/grievance': [
    { label: 'Helpdesk', href: '/helpdesk' },
    { label: 'Grievances' },
  ],
  '/my-worklife': [{ label: 'My Worklife', href: '/my-worklife' }],
  '/profile': [{ label: 'Profile', href: '/profile' }],
  '/settings': [{ label: 'Settings', href: '/settings' }],
  '/todo': [{ label: 'To Do', href: '/todo' }],
  '/admin/audit-logs': [
    { label: 'Admin', href: '#admin' },
    { label: 'Audit Logs' },
  ],
  '/org/departments': [
    { label: 'Organization', href: '#org' },
    { label: 'Departments' },
  ],
  '/org/designations': [
    { label: 'Organization', href: '#org' },
    { label: 'Designations' },
  ],
};

export default function Breadcrumbs({ items, sx }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Build breadcrumbs from pathname if items not provided
  let breadcrumbItems: BreadcrumbItem[] = items || [];

  if (!items) {
    // Try exact match first
    if (pathBreadcrumbMap[pathname]) {
      breadcrumbItems = pathBreadcrumbMap[pathname];
    } else {
      // Try pattern matching for dynamic routes
      for (const [pattern, crumbs] of Object.entries(pathBreadcrumbMap)) {
        if (pattern.includes('[')) {
          const regex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$');
          if (regex.test(pathname)) {
            breadcrumbItems = crumbs;
            break;
          }
        }
      }
    }
  }

  // Always include home at the beginning
  const allItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
    ...breadcrumbItems,
  ];

  if (allItems.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {allItems.length > 1 && (
          <Box
            onClick={() => window.history.back()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              boxShadow: '0 2px 4px -1px rgba(0,0,0,0.03)',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' }
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
        <MuiBreadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
          aria-label="breadcrumb"
        >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          if (isLast) {
            return (
              <Typography
                key={index}
                sx={{
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {index === 0 && <HomeIcon sx={{ fontSize: 18 }} />}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              href={(item.href || '#') as any}
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.textDecoration = 'none';
              }}
            >
              {index === 0 && <HomeIcon sx={{ fontSize: 18 }} />}
              {item.label}
            </Link>
          );
        })}
        </MuiBreadcrumbs>
      </Box>
    </Box>
  );
}
