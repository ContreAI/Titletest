/**
 * Standard Dashboard Spacing System
 * Consistent spacing values for padding, margin, and gaps
 */

export const dashboardSpacing = {
  // Card/Paper border radius
  cardBorderRadius: 2,   // 8px - standard card border radius

  // Card/Paper padding
  cardPadding: 3,        // 24px - standard card padding
  cardPaddingSm: 2,      // 16px - small card padding
  cardPaddingLg: 4,      // 32px - large card padding
  
  // Section spacing
  sectionSpacing: 3,     // 24px - spacing between major sections
  componentSpacing: 2,   // 16px - spacing between components within a section
  
  // Content spacing
  contentGap: 2,         // 16px - gap between content items
  contentGapSm: 1.5,     // 12px - small gap
  contentGapXs: 1,       // 8px - extra small gap
  
  // Layout padding
  layoutPadding: {
    xs: 2,               // 16px - mobile
    md: 3,               // 24px - tablet
    lg: 4,               // 32px - desktop
  },
  
  // Header spacing
  headerPadding: {
    xs: 2,               // 16px - mobile
    md: 3,               // 24px - desktop
  },
  headerMarginBottom: 2, // 16px
  
  // List/Grid spacing
  gridSpacing: 3,        // 24px - spacing between grid items
  listItemSpacing: 1.5,  // 12px - spacing between list items
} as const;

export default dashboardSpacing;

