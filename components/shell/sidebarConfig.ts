export type SidebarItem = {
  label: string;
  href: string;
  icon:
    | 'home'
    | 'engage'
    | 'worklife'
    | 'todo'
    | 'salary'
    | 'leave'
    | 'attendance'
    | 'expense'
    | 'docs'
    | 'receipt'
    | 'savings'
    | 'people'
    | 'helpdesk'
    | 'requests'
    | 'workflow'
    | 'dashboard'
    | 'employees'
    | 'payroll'
    | 'leaves'
    | 'profile'
    | 'settings'
    | 'calendar'
    | 'performance'
    | 'notifications'
    | 'services'
    | 'leaveApply'
    | 'balance'
    | 'timesheet'
    | 'overtime'
    | 'compOff'
    | 'regularization'
    | 'roster'
    | 'biometrics'
    | 'campaign'
    | 'badge'
    | 'problem';
  requiredAnyPermissions?: string[];
  adminOnly?: boolean;
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
    requiredAnyPermissions: ['view_announcements', 'raise_support_ticket', 'manage_grievances', 'manage_gatepasses'],
  },
  {
    label: 'My Worklife',
    href: '/my-worklife',
    icon: 'worklife',
    requiredAnyPermissions: ['view_profile', 'edit_profile', 'change_password'],
  },
  {
    label: 'To Do',
    href: '/todo',
    icon: 'todo',
    requiredAnyPermissions: ['view_tasks'],
  },
  {
    label: 'Salary',
    href: '/payroll',
    icon: 'salary',
    requiredAnyPermissions: ['view_payroll', 'view_payslip_own'],
    children: [
      { label: 'Payslips', href: '/payroll/payslips', icon: 'receipt', requiredAnyPermissions: ['view_payroll', 'view_payslip_own'] },
      { label: 'Compensation & Claims', href: '/payroll/financials', icon: 'expense' },
      { label: 'YTD Reports', href: '#ytd', icon: 'dashboard' },
      { label: 'IT Statement', href: '#it-statement', icon: 'docs' },
      { label: 'IT Declaration', href: '#it-declaration', icon: 'settings' },
      { label: 'Loans and Advances', href: '#loans', icon: 'savings' },
      { label: 'Reimbursement', href: '#reimbursement', icon: 'expense' },
      { label: 'Proof Of Investment', href: '#poi', icon: 'worklife' },
      { label: 'Salary Revision', href: '#revision', icon: 'performance' },
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
        icon: 'leaveApply',
        requiredAnyPermissions: ['request_leave']
      },
      {
        label: 'Leave Balances',
        href: '/leaves/balances',
        icon: 'balance',
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
        icon: 'timesheet',
      },
      {
        label: 'Overtime',
        href: '/attendance/overtime',
        icon: 'overtime',
      },
      {
        label: 'Comp-Off',
        href: '/attendance/comp-off',
        icon: 'compOff',
      },
      {
        label: 'Regularization',
        href: '/attendance/info',
        icon: 'regularization',
      },
      {
        label: 'Shift Roster',
        href: '/attendance/rosters',
        icon: 'roster',
        requiredAnyPermissions: ['manage_attendance']
      },
      {
        label: 'Biometrics Sync',
        href: '/attendance/biometrics',
        icon: 'biometrics',
        requiredAnyPermissions: ['manage_attendance']
      }
    ]
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: 'performance',
    requiredAnyPermissions: ['view_performance_own', 'manage_performance'],
    children: [
      {
        label: 'Goals & KPIs',
        href: '/performance',
        icon: 'performance',
        requiredAnyPermissions: ['view_performance_own', 'manage_performance'],
      },
      {
        label: 'Training & Certifications',
        href: '/performance/training',
        icon: 'performance',
        requiredAnyPermissions: ['view_performance_own', 'manage_performance'],
      }
    ]
  },
  {
    label: 'Expense Claims',
    href: '#expense',
    icon: 'expense',
    requiredAnyPermissions: ['view_expense_claims_own', 'approve_expenses'],
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
      { label: 'Org Hierarchy', href: '/org-chart', icon: 'people', requiredAnyPermissions: ['view_employee'] },
      { label: 'Recruitment & ATS', href: '/recruitment', icon: 'people', requiredAnyPermissions: ['manage_recruitment'] },
      { label: 'Lifecycle', href: '/lifecycle', icon: 'workflow', requiredAnyPermissions: ['create_employee', 'delete_employee', 'manage_org'] },
    ]
  },
  {
    label: 'Request Hub',
    href: '/helpdesk',
    icon: 'helpdesk',
    requiredAnyPermissions: ['raise_support_ticket', 'view_announcements', 'manage_helpdesk', 'manage_gatepasses', 'manage_grievances'],
    children: [
      {
        label: 'Support Tickets',
        href: '/helpdesk',
        icon: 'helpdesk',
        requiredAnyPermissions: ['raise_support_ticket', 'manage_helpdesk'],
      },
      {
        label: 'Announcements',
        href: '/announcements',
        icon: 'campaign',
        requiredAnyPermissions: ['view_announcements', 'manage_announcements'],
      },
      {
        label: 'Gate Pass',
        href: '/gate-pass',
        icon: 'badge',
        requiredAnyPermissions: ['manage_gatepasses'],
      },
      {
        label: 'Grievances',
        href: '/grievance',
        icon: 'problem',
        requiredAnyPermissions: ['manage_grievances'],
      }
    ]
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: 'notifications',
    requiredAnyPermissions: ['view_announcements', 'manage_notifications'],
    children: [
      {
        label: 'Notification Center',
        href: '/notifications',
        icon: 'notifications',
        requiredAnyPermissions: ['view_announcements', 'manage_notifications'],
      },
      {
        label: 'Settings',
        href: '/settings/notifications',
        icon: 'settings',
        requiredAnyPermissions: ['manage_notifications'],
      }
    ]
  },
  {
    label: 'Services',
    href: '/services',
    icon: 'services',
    adminOnly: true,
  },
  {
    label: 'Dynamic Workflows',
    href: '/workflow',
    icon: 'workflow',
    requiredAnyPermissions: ['manage_workflows']
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

export { SIDEBAR_ITEMS };
