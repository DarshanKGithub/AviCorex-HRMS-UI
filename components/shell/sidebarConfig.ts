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
    | 'problem'
    | 'ytd'
    | 'itDeclaration'
    | 'reimbursement'
    | 'investment'
    | 'revision'
    | 'goals'
    | 'training'
    | 'directory'
    | 'hierarchy'
    | 'recruitment'
    | 'clients'
    | 'packages'
    | 'tickets'
    | 'notificationCenter'
    | 'notificationSettings';
  requiredAnyPermissions?: string[];
  requiredAnyEntitlements?: string[];
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
    requiredAnyEntitlements: ['payroll'],
    children: [
      { label: 'Payslips', href: '/payroll/payslips', icon: 'receipt', requiredAnyPermissions: ['view_payroll', 'view_payslip_own'] },
      { label: 'Compensation & Claims', href: '/payroll/financials', icon: 'expense', requiredAnyPermissions: ['view_payroll', 'approve_expenses'] },
      { label: 'YTD Reports', href: '/payroll/ytd', icon: 'ytd', requiredAnyPermissions: ['view_payroll', 'approve_expenses'] },
      { label: 'IT Statement', href: '/payroll/it-statement', icon: 'docs' },
      { label: 'IT Declaration', href: '/payroll/it-declaration', icon: 'itDeclaration' },
      { label: 'Loans and Advances', href: '/payroll/loans', icon: 'savings' },
      { label: 'Reimbursement', href: '/payroll/reimbursement', icon: 'reimbursement' },
      { label: 'Proof Of Investment', href: '/payroll/poi', icon: 'investment', requiredAnyPermissions: ['view_payroll', 'approve_expenses'] },
      { label: 'Salary Revision', href: '/payroll/revision', icon: 'revision' },
    ]
  },
  {
    label: 'Leave',
    href: '/leaves',
    icon: 'leave',
    requiredAnyPermissions: ['view_leave', 'view_leave_own', 'request_leave'],
    requiredAnyEntitlements: ['leave_management'],
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
    requiredAnyEntitlements: ['attendance_tracking'],
    children: [
      {
        label: 'Dashboard',
        href: '/attendance',
        icon: 'dashboard',
      },
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
    requiredAnyEntitlements: ['performance_management'],
    children: [
      {
        label: 'Goals & KPIs',
        href: '/performance',
        icon: 'goals',
        requiredAnyPermissions: ['view_performance_own', 'manage_performance'],
      },
      {
        label: 'Training & Certifications',
        href: '/performance/training',
        icon: 'training',
        requiredAnyPermissions: ['view_performance_own', 'manage_performance'],
      }
    ]
  },
  {
    label: 'Document Center',
    href: '/documents',
    icon: 'docs',
    requiredAnyPermissions: ['view_employee'],
    requiredAnyEntitlements: ['document_management'],
  },
  {
    label: 'People',
    href: '/employees',
    icon: 'people',
    requiredAnyPermissions: ['view_employee'],
    children: [
      { label: 'Directory', href: '/employees', icon: 'directory', requiredAnyPermissions: ['view_employee'] },
      { label: 'Org Hierarchy', href: '/org-chart', icon: 'hierarchy', requiredAnyPermissions: ['view_employee'] },
      { label: 'Recruitment & ATS', href: '/recruitment', icon: 'recruitment', requiredAnyPermissions: ['manage_recruitment'] },
      { label: 'Lifecycle', href: '/lifecycle', icon: 'workflow', requiredAnyPermissions: ['create_employee', 'delete_employee', 'manage_org'] },
    ]
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: 'clients',
    adminOnly: true,
  },
  {
    label: 'Package Manager',
    href: '/admin/packages',
    icon: 'packages',
    adminOnly: true,
  },
  {
    label: 'Request Hub',
    href: '/helpdesk',
    icon: 'helpdesk',
    requiredAnyPermissions: ['raise_support_ticket', 'view_announcements', 'manage_helpdesk', 'manage_gatepasses', 'manage_grievances'],
    requiredAnyEntitlements: ['helpdesk'],
    children: [
      {
        label: 'Support Tickets',
        href: '/helpdesk',
        icon: 'tickets',
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
        icon: 'notificationCenter',
        requiredAnyPermissions: ['view_announcements', 'manage_notifications'],
      },
      {
        label: 'Settings',
        href: '/settings/notifications',
        icon: 'notificationSettings',
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
  // {
  //   label: 'Dynamic Workflows',
  //   href: '/workflow',
  //   icon: 'workflow',
  //   requiredAnyPermissions: ['manage_workflows']
  // }
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
