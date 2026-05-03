import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type SectionPageProps = {
  label: string;
  title: string;
  description: string;
  bullets: string[];
};

export function SectionPage({ label, title, description, bullets }: SectionPageProps) {
  return (
    <Box className="mx-auto max-w-5xl">
      <Stack spacing={3}>
        <Box>
          <Chip label={label} sx={{ bgcolor: 'rgba(178, 174, 242, 0.16)', color: '#4f4b9c', fontWeight: 800 }} />
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 800, letterSpacing: '-0.04em', color: '#15162c' }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1, color: '#5b5f7a', lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 5, border: '1px solid #e7e9ef', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={1.5}>
              {bullets.map((bullet) => (
                <Box key={bullet} sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: 0.9, width: 10, height: 10, borderRadius: 999, bgcolor: '#928ddd' }} />
                  <Typography sx={{ color: '#1f2340', lineHeight: 1.8 }}>{bullet}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
