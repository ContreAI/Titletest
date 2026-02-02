import { Box, BoxProps, Link } from '@mui/material';
import paths from 'routes/paths';
import { useColorScheme } from '@mui/material/styles';
import contreLogoLight from 'assets/images/logo/contre-logo-light.svg';
import contreLogoDark from 'assets/images/logo/contre-logo-dark.svg';

interface LogoProps extends BoxProps {
  showName?: boolean;
}

const Logo = ({ sx, showName = true, ...rest }: LogoProps) => {
  const { mode } = useColorScheme();
  
  // Dark mode: use logo with transparent background
  // Light mode: use logo with transparent background
  const logoSrc = mode === 'dark' ? contreLogoDark : contreLogoLight;

  return (
    <Link
      href={paths.dashboard}
      underline="none"
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="Contre"
        sx={{
          height: showName ? 32 : 28,
          width: 'auto',
          maxWidth: showName ? 140 : 50,
          objectFit: 'contain',
          ...sx,
        }}
        {...rest}
      />
    </Link>
  );
};

export default Logo;
