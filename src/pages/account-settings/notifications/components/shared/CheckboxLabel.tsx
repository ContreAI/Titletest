import { Typography } from '@mui/material';

interface CheckboxLabelProps {
  children: React.ReactNode;
}

const CheckboxLabel = ({ children }: CheckboxLabelProps) => {
  return (
    <Typography
      sx={{
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      {children}
    </Typography>
  );
};

export default CheckboxLabel;

