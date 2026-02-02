import { TypographyVariantsOptions } from '@mui/material/styles';

// Extend MUI Typography to include custom monospace variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    mono: React.CSSProperties;
    monoLarge: React.CSSProperties;
    monoSmall: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    mono?: React.CSSProperties;
    monoLarge?: React.CSSProperties;
    monoSmall?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    mono: true;
    monoLarge: true;
    monoSmall: true;
  }
}

// Font families
export const fontFamilies = {
  primary: ['Manrope', 'sans-serif'].join(','), // Primary font for body text
  headers: ['Bebas Neue', 'sans-serif'].join(','), // Headers only (h1-h6)
  monospace: ['JetBrains Mono', 'monospace'].join(','), // Monospace variants
};

const typography: TypographyVariantsOptions = {
  // Default body font - Manrope
  fontFamily: fontFamilies.primary,
  
  // H1-H2: Bebas Neue - Dashboard sizes (heavier weight for visual hierarchy)
  h1: {
    fontFamily: fontFamilies.headers,
    fontWeight: 600,
    fontSize: '2rem', // 32px
    lineHeight: 1.25, // 40px - tight for large headings
    letterSpacing: '0.05em',
  },
  h2: {
    fontFamily: fontFamilies.headers,
    fontWeight: 500,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.3, // 31.2px - tight for headings
    letterSpacing: '0.05em',
  },
  
  // H3-H6: Bebas Neue Regular - Dashboard sizes
  h3: {
    fontFamily: fontFamilies.headers,
    fontWeight: 400,
    fontSize: '1.375rem', // 22px
    lineHeight: 1.3, // 28.6px
    letterSpacing: '0.05em',
  },
  h4: {
    fontFamily: fontFamilies.headers,
    fontWeight: 400,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.3, // 26px
    letterSpacing: '0.05em',
  },
  h5: {
    fontFamily: fontFamilies.headers,
    fontWeight: 400,
    fontSize: '1.125rem', // 18px
    lineHeight: 1.35, // 24.3px
    letterSpacing: '0.05em',
  },
  h6: {
    fontFamily: fontFamilies.headers,
    fontWeight: 400,
    fontSize: '1rem', // 16px
    lineHeight: 1.4, // 22.4px
    letterSpacing: '0.05em',
  },
  
  // Subtitles: Manrope - Dashboard sizes
  subtitle1: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '1rem', // 16px
    lineHeight: 1.5, // 24px
    letterSpacing: '0.05em',
  },
  subtitle2: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '0.9375rem', // 15px
    lineHeight: 1.5, // 22.5px
    letterSpacing: '0.05em',
  },
  
  // Body: Manrope - Dashboard sizes
  body1: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57, // 22px - optimal for readability
  },
  body2: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '0.8125rem', // 13px
    lineHeight: 1.54, // 20px - optimal for readability
  },
  
  // Button: Manrope SemiBold - Dashboard sizes
  button: {
    fontFamily: fontFamilies.primary,
    fontWeight: 600,
    fontSize: '0.8125rem', // 13px
    lineHeight: 1.54, // 20px - matches body2
    textTransform: 'capitalize',
  },
  
  // Caption & Overline: Manrope - Dashboard sizes (12px minimum)
  caption: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5, // 18px
  },
  overline: {
    fontFamily: fontFamilies.primary,
    fontWeight: 400,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5, // 18px
    textTransform: 'uppercase',
  },
  
  // Monospace variants: JetBrains Mono (for numbers, codes, IDs)
  mono: {
    fontFamily: fontFamilies.monospace,
    fontWeight: 400,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57, // 22px - matches body1
    letterSpacing: 0,
  },
  monoLarge: {
    fontFamily: fontFamilies.monospace,
    fontWeight: 500,
    fontSize: '1.175rem', // 18.8px
    lineHeight: 1.4, // 26.3px
    letterSpacing: 0,
  },
  monoSmall: {
    fontFamily: fontFamilies.monospace,
    fontWeight: 400,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5, // 18px
    letterSpacing: 0,
  },
};

export default typography;
