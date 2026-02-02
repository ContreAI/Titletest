const keyFrames = () => ({
  '@keyframes linearLeftToRight': {
    '0%': {
      backgroundPosition: 'left 100%',
    },
    '100%': {
      backgroundPosition: 'right 100%',
    },
  },
  '@keyframes spin': {
    to: { transform: 'rotate(360deg)' },
  },
  '@keyframes dash': {
    '0%, 100%': {
      strokeDasharray: '0 180',
    },
    '50%': {
      strokeDasharray: '80 120',
    },
  },
  '@keyframes staggeredFadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(8px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});

export default keyFrames;
