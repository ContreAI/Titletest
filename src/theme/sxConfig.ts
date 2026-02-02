import type { SxConfig } from '@mui/system';

// Custom sx config for lineClamp utility

const sxConfig: SxConfig = {
  lineClamp: {
    style: (props) => {
      const lineClamp = (props as { lineClamp?: number }).lineClamp;
      return lineClamp
        ? {
            display: '-webkit-box',
            WebkitLineClamp: String(lineClamp),
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }
        : {};
    },
  },
};

export default sxConfig;
