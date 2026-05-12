import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import HelpCenterRoundedIcon from '@mui/icons-material/HelpCenterRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EngageIcon from '@mui/icons-material/FavoriteRounded';
import WorkIcon from '@mui/icons-material/WorkRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import OrgChartIcon from '@mui/icons-material/AccountTreeRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsRounded';

export const iconMap: Record<string, React.ComponentType<any>> = {
  'dashboard': DashboardRoundedIcon,
  'home': DashboardRoundedIcon,
  'leave': DirectionsRunRoundedIcon,
  'people': GroupsRoundedIcon,
  'employees': GroupsRoundedIcon,
  'payroll': PaymentsRoundedIcon,
  'salary': PaymentsRoundedIcon,
  'profile': PersonRoundedIcon,
  'settings': SettingsRoundedIcon,
  'attendance': TodayRoundedIcon,
  'calendar': EventNoteRoundedIcon,
  'requests': AssignmentRoundedIcon,
  'engagement': EngageIcon,
  'engage': EngageIcon,
  'workflow': WorkIcon,
  'performance': InsightsRoundedIcon,
  'docs': DescriptionRoundedIcon,
  'todo': ChecklistRoundedIcon,
  'expense': AccountBalanceWalletRoundedIcon,
  'helpdesk': HelpCenterRoundedIcon,
  'notifications': NotificationsRoundedIcon,
  'worklife': EmojiEventsIcon,
  'org': OrgChartIcon,
};
