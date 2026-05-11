export type SidebarItem = {
  label: string;
  href: string;
  icon: 'home' | 'engage' | 'worklife' | 'todo' | 'salary' | 'leave' | 'attendance' | 'expense' | 'docs' | 'people' | 'helpdesk' | 'requests' | 'workflow' | 'dashboard' | 'employees' | 'payroll' | 'leaves' | 'profile' | 'settings' | 'calendar' | 'performance' | 'notifications';
  requiredAnyPermissions?: string[];
  children?: SidebarItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: 'home',
    requiredAnyPermissions: ['view_dashboard']
  },
  {
    label: 'Engage',
    href: '/engage',
    icon: 'engage',
  },
  {
    label: 'My Worklife',
    href: '/my-worklife',
    icon: 'worklife',
  },
  {
    label: 'To Do',
    href: '/todo',
    icon: 'todo',
  },
  {
    label: 'Salary',
    href: '/payroll',
    icon: 'salary',
    requiredAnyPermissions: ['view_payroll', 'view_payslip_own'],
    children: [
      { label: 'Payslips', href: '/payroll/payslips', icon: 'salary', requiredAnyPermissions: ['view_payroll', 'view_payslip_own'] },
      { label: 'Compensation & Claims', href: '/payroll/financials', icon: 'salary' },
      { label: 'YTD Reports', href: '#ytd', icon: 'salary' },
      { label: 'IT Statement', href: '#it-statement', icon: 'salary' },
      { label: 'IT Declaration', href: '#it-declaration', icon: 'salary' },
      { label: 'Loans and Advances', href: '#loans', icon: 'salary' },
      { label: 'Reimbursement', href: '#reimbursement', icon: 'salary' },
      { label: 'Proof Of Investment', href: '#poi', icon: 'salary' },
      { label: 'Salary Revision', href: '#revision', icon: 'salary' },
    ]
  },
  {
    label: 'Leave',
    href: '/leaves',
    icon: 'leave',
    requiredAnyPermissions: ['view_leave', 'view_leave_own', 'request_leave'],
    children: [
      {
        label: 'Leave Apply',
        href: '/leaves',
        icon: 'leave',
        requiredAnyPermissions: ['request_leave']
      },
      {
        label: 'Leave Balances',
        href: '/leaves/balances',
        icon: 'dashboard',
        requiredAnyPermissions: ['view_leave', 'view_leave_own']
      },
      {
        label: 'Leave Calendar',
        href: '/leaves/holidays',
        icon: 'calendar',
      }
    ]
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: 'attendance',
    requiredAnyPermissions: ['view_attendance', 'view_attendance_own'],
    children: [
      {
        label: 'Timesheets',
        href: '/attendance/timesheets',
        icon: 'attendance',
      },
      {
        label: 'Overtime',
        href: '/attendance/overtime',
        icon: 'attendance',
      },
      {
        label: 'Comp-Off',
        href: '/attendance/comp-off',
        icon: 'attendance',
      },
      {
        label: 'Regularization',
        href: '/attendance/info',
        icon: 'attendance',
      },
      {
        label: 'Shift Roster',
        href: '/attendance/rosters',
        icon: 'attendance',
        requiredAnyPermissions: ['manage_attendance']
      },
      {
        label: 'Biometrics Sync',
        href: '/attendance/biometrics',
        icon: 'attendance',
        requiredAnyPermissions: ['manage_attendance']
      }
    ]
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: 'performance',
    children: [
      {
        label: 'Goals & KPIs',
        href: '/performance',
        icon: 'performance',
      },
      {
        label: 'Training & Certifications',
        href: '/performance/training',
        icon: 'performance',
      }
    ]
  },
  {
    label: 'Expense Claims',
    href: '#expense',
    icon: 'expense',
  },
  {
    label: 'Document Center',
    href: '/documents',
    icon: 'docs',
    requiredAnyPermissions: ['view_employee']
  },
  {
    label: 'People',
    href: '/employees',
    icon: 'people',
    requiredAnyPermissions: ['view_employee'],
    children: [
      { label: 'Directory', href: '/employees', icon: 'people', requiredAnyPermissions: ['view_employee'] },
      { label: 'Org Hierarchy', href: '/organization/hierarchy', icon: 'people', requiredAnyPermissions: ['view_employee'] },
      { label: 'Recruitment & ATS', href: '/recruitment', icon: 'people' },
      { label: 'Lifecycle', href: '/lifecycle', icon: 'workflow' },
    ]
  },
  {
    label: 'Request Hub',
    href: '/helpdesk',
    icon: 'helpdesk',
    children: [
      {
        label: 'Support Tickets',
        href: '/helpdesk',
        icon: 'helpdesk',
      },
      {
        label: 'Announcements',
        href: '/announcements',
        icon: 'engage',
      },
      {
        label: 'Gate Pass',
        href: '/gate-pass',
        icon: 'requests',
      },
      {
        label: 'Grievances',
        href: '/grievance',
        icon: 'requests',
      }
    ]
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: 'notifications',
    children: [
      {
        label: 'Notification Center',
        href: '/notifications',
        icon: 'notifications',
      },
      {
        label: 'Settings',
        href: '/settings/notifications',
        icon: 'settings',
      }
    ]
  }
];

function hasAnyPermission(userPermissions: Set<string>, required: string[] | undefined): boolean {
  if (!required || required.length === 0) {
    return true;
  }
  if (userPermissions.has('*')) {
    return true;
  }
  return required.some((permission) => userPermissions.has(permission));
}

export function generateSidebarItems(userPermissions: Set<string>): SidebarItem[] {
  return SIDEBAR_ITEMS
    .filter((item) => hasAnyPermission(userPermissions, item.requiredAnyPermissions))
    .map((item) => {
      if (!item.children || item.children.length === 0) {
        return item;
      }

      const children = item.children.filter((child) => hasAnyPermission(userPermissions, child.requiredAnyPermissions));
      return {
        ...item,
        children
      };
    })
    .filter((item) => {
      if (!item.children) {
        return true;
      }
      return item.children.length > 0;
    });
}
