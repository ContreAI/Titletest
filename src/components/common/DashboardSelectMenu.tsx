import { MenuItem, SxProps } from '@mui/material';
import StyledFormControl from 'components/styled/StyledFormControl';
import StyledTextField from 'components/styled/StyledTextField';

interface DashboardSelectMenuProps {
  options?: {
    value: string | number;
    label: string;
  }[];
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  sx?: SxProps;
}
const defaultOptions = [
  {
    value: 1,
    label: 'Last month',
  },
  {
    value: 6,
    label: 'Last 6 months',
  },
  {
    value: 12,
    label: 'Last 12 months',
  },
];

const DashboardSelectMenu = ({
  options = defaultOptions,
  onChange,
  defaultValue,
  sx,
}: DashboardSelectMenuProps) => {
  const handleChange = (value: string | number) => {
    if (onChange) {
      onChange(value);
    }
  };
  return (
    <StyledFormControl sx={{ width: 150, minWidth: 120, ...sx }} size="small" variant="filled">
      <StyledTextField
        select
        defaultValue={defaultValue}
        size="small"
        onChange={({ target: { value } }) => handleChange(value as string)}
      >
        {options.map((option) => (
          <MenuItem value={option.value} key={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </StyledTextField>
    </StyledFormControl>
  );
};

export default DashboardSelectMenu;
