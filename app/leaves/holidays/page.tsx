import HolidayCalendar from '../../../components/leaves/HolidayCalendar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export const metadata = {
  title: 'Holiday Calendar'
};

export default function HolidaysPage() {
  return (
    <Box className="mx-auto max-w-6xl px-4 py-6">
      <Chip label="Holiday Calendar" sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800, mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c', mb: 1 }}>
        Holiday Calendar
      </Typography>
      <Typography sx={{ mt: 0, color: '#5b5f7a', lineHeight: 1.6, mb: 4 }}>
        View company holidays and important dates.
      </Typography>

      <HolidayCalendar />
    </Box>
  );
}
