import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import HelpCenterRoundedIcon from '@mui/icons-material/HelpCenterRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EngageIcon from '@mui/icons-material/FavoriteRounded';
import WorkIcon from '@mui/icons-material/WorkRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import OrgChartIcon from '@mui/icons-material/AccountTreeRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsRounded';

import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CurrencyExchangeRoundedIcon from '@mui/icons-material/CurrencyExchangeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ModelTrainingRoundedIcon from '@mui/icons-material/ModelTrainingRounded';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import DisplaySettingsRoundedIcon from '@mui/icons-material/DisplaySettingsRounded';

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
  'services': ConstructionRoundedIcon,
  'attendance': TodayRoundedIcon,
  'calendar': EventNoteRoundedIcon,
  'leaveApply': AssignmentTurnedInRoundedIcon,
  'balance': BusinessCenterRoundedIcon,
  'timesheet': EventNoteRoundedIcon,
  'overtime': AccessTimeRoundedIcon,
  'compOff': EventAvailableRoundedIcon,
  'regularization': FactCheckRoundedIcon,
  'roster': TodayRoundedIcon,
  'biometrics': FingerprintRoundedIcon,
  'requests': AssignmentRoundedIcon,
  'engagement': EngageIcon,
  'engage': EngageIcon,
  'workflow': WorkIcon,
  'performance': InsightsRoundedIcon,
  'docs': DescriptionRoundedIcon,
  'receipt': ReceiptLongRoundedIcon,
  'savings': SavingsRoundedIcon,
  'todo': ChecklistRoundedIcon,
  'expense': AccountBalanceWalletRoundedIcon,
  'helpdesk': HelpCenterRoundedIcon,
  'campaign': CampaignRoundedIcon,
  'badge': BadgeRoundedIcon,
  'problem': ReportProblemRoundedIcon,
  'notifications': NotificationsRoundedIcon,
  'worklife': EmojiEventsIcon,
  'org': OrgChartIcon,
  
  // New unique icons
  'ytd': InsertChartOutlinedRoundedIcon,
  'itDeclaration': GavelRoundedIcon,
  'reimbursement': CurrencyExchangeRoundedIcon,
  'investment': TrendingUpRoundedIcon,
  'revision': AutoGraphRoundedIcon,
  'goals': FlagRoundedIcon,
  'training': ModelTrainingRoundedIcon,
  'directory': ContactPhoneRoundedIcon,
  'hierarchy': OrgChartIcon,
  'recruitment': PersonAddAlt1RoundedIcon,
  'clients': HandshakeRoundedIcon,
  'packages': Inventory2RoundedIcon,
  'tickets': ConfirmationNumberRoundedIcon,
  'notificationCenter': MarkEmailUnreadRoundedIcon,
  'notificationSettings': DisplaySettingsRoundedIcon,
};
