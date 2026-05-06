export type SidebarItem = {
  label: string;
  href: string;
  icon: 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'leaves' | 'profile' | 'settings' | 'calendar';
  requiredAnyPermissions?: string[];
  children?: SidebarItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    requiredAnyPermissions: ['view_dashboard']
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: 'employees',
    requiredAnyPermissions: ['view_employee']
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: 'attendance',
    requiredAnyPermissions: ['view_attendance', 'view_attendance_own']
  },
  {
    label: 'Payroll',
    href: '/payroll',
    icon: 'payroll',
    requiredAnyPermissions: ['view_payroll', 'view_payslip_own'],
  },
  {
    label: 'Leaves',
    href: '/leaves',
    icon: 'leaves',
    requiredAnyPermissions: ['view_leave', 'view_leave_own', 'request_leave'],
    children: [
      {
        label: 'Holiday Calendar',
        href: '/leaves/holidays',
        icon: 'calendar',
        requiredAnyPermissions: ['view_leave', 'view_leave_own', 'request_leave']
      },
      {
        label: 'Apply Leave',
        href: '/leaves?tab=apply',
        icon: 'leaves',
        requiredAnyPermissions: ['request_leave']
      },
      {
        label: 'Leave Balance',
        href: '/leaves?tab=balance',
        icon: 'dashboard',
        requiredAnyPermissions: ['view_leave', 'view_leave_own']
      }
    ]
  },
  {
    label: 'My Profile',
    href: '/profile',
    icon: 'profile',
    requiredAnyPermissions: ['view_profile']
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'settings',
    requiredAnyPermissions: ['manage_settings']
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
