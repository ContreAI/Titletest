import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const Typography: Components<Omit<Theme, 'components'>>['MuiTypography'] = {
  defaultProps: {
    variantMapping: {
      subtitle2: 'p',
      mono: 'span',
      monoLarge: 'span',
      monoSmall: 'span',
    },
  },
};

export default Typography;
