// Pacific Northwest Theme - Brand Colors

export const brandColors = {
  // Primary Brand
  spruce: '#264E36',           // Primary brand color
  
  // Secondary/CTAs
  riverStone: '#78909C',       // Secondary and call-to-action buttons
  
  // UI Elements
  // WCAG Note: seaGlass (#9DBFBF) has insufficient contrast on light backgrounds
  // - vs White: 1.97:1 (FAIL) - vs Mist: 1.84:1 (FAIL) - vs StormGray: 4.89:1 (PASS)
  // Use seaGlass only for decorative elements (borders, backgrounds, icons)
  // Use seaGlassText for any text content on light backgrounds
  seaGlass: '#9DBFBF',         // Borders, decorative UI elements only (not for text on light bg)
  seaGlassText: '#5E7373',     // Text variant with WCAG AA contrast (5.03:1 vs white)
  
  // Backgrounds
  mist: '#F5F7F7',             // Light backgrounds
  
  // Text/Dark Mode
  stormGray: '#37474F',        // Dark mode backgrounds, primary text
  
  // States
  fern: '#607D3B',             // Success states
  
  // Accents
  barkBrown: '#6F4E37',        // Accent (use sparingly)
  
  // Alerts
  signalRed: '#CC0000',        // Critical alerts only
  amber: '#F59E0B',            // Warnings
};

export default brandColors;

