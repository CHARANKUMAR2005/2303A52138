import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const FILTERS = ['All', 'Placement', 'Result', 'Event'];

export function NotificationFilter({ value, onChange }) {
  const handleChange = (_, newValue) => {
    // MUI sends null when the active button is clicked again; keep the current value.
    if (newValue !== null) onChange(newValue);
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      onChange={handleChange}
      sx={{ flexWrap: 'wrap', gap: 0.5 }}
    >
      {FILTERS.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: 'none', px: 2 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}