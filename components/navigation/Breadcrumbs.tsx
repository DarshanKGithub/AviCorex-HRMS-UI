'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
    { label: 'Financials & Claims', href: '/payroll/financials' },
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
  '/gate-pass': [
    { label: 'Helpdesk', href: '/helpdesk' },
    { label: 'Gate Pass' },
  ],
  '/grievance': [
    { label: 'Helpdesk', href: '/helpdesk' },
    { label: 'Grievances' },
  ],
  '/profile': [{ label: 'Profile', href: '/profile' }],
  '/settings': [{ label: 'Settings', href: '/settings' }],
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
    <Box sx={{ mb: 3, ...sx }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 20 }} />}
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
  );
}
