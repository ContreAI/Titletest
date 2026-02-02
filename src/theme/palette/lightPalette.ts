import { PaletteOptions, alpha } from '@mui/material/styles';
import { cssVarRgba, generatePaletteChannel } from 'lib/utils';
import {
  basic,
  brown,
  grey as colorGrey,
  green,
  lightBlue,
  orange,
  purple,
  red,
  spruce,
} from 'theme/palette/colors';

const common = generatePaletteChannel({ white: basic.white, black: basic.black });
const grey = generatePaletteChannel(colorGrey);

const primary = generatePaletteChannel({
  lighter: spruce[50],
  light: spruce[400],
  main: spruce[500],
  dark: spruce[600],
  darker: spruce[900],
});
const secondary = generatePaletteChannel({
  lighter: purple[50],
  light: purple[300],
  main: purple[500],
  dark: purple[700],
  darker: purple[900],
});
const error = generatePaletteChannel({
  lighter: red[50],
  light: red[300],
  main: red[500],
  dark: red[600],
  darker: red[900],
});
const warning = generatePaletteChannel({
  lighter: orange[50],
  light: orange[400],
  main: orange[500],
  dark: orange[700],
  darker: orange[900],
  contrastText: common.white,
  text: orange.text, // WCAG AA compliant color for text on white backgrounds
});
const success = generatePaletteChannel({
  lighter: green[50],
  light: green[400],
  main: green[500],
  dark: green[700],
  darker: green[900],
});
const info = generatePaletteChannel({
  lighter: lightBlue[50],
  light: lightBlue[300],
  main: lightBlue[500],
  dark: lightBlue[700],
  darker: lightBlue[900],
  contrastText: common.white,
});
const neutral = generatePaletteChannel({
  lighter: grey[100],
  light: grey[600],
  main: grey[800],
  dark: grey[900],
  darker: grey[950],
  contrastText: common.white,
});

const action = generatePaletteChannel({
  active: grey[500],
  hover: grey[100],
  selected: grey[100],
  disabled: grey[400],
  disabledBackground: grey[200],
  focus: grey[300],
});
const divider = '#E6E8EB'; // Custom divider color
const menuDivider = cssVarRgba(grey['700Channel'], 0);
const dividerLight = cssVarRgba(grey['300Channel'], 0.6);
const text = generatePaletteChannel({
  primary: '#1B2124',      // Dark text for readability
  secondary: '#264E36',    // Spruce (brand color for secondary text)
  disabled: '#6B7B85',     // Darkened for WCAG AA contrast (4.5:1 on white)
  tertiary: '#78909C',     // River Stone (for tertiary text)
});
const background = generatePaletteChannel({
  default: basic.white,
  paper: basic.white,
  neutral: '#FAFAFC',      // Light neutral background
  subtle: '#F7FAF8',       // Very light grey-green background
  elevation0: grey[150],
  elevation1: grey[50],
  elevation2: grey[100],
  elevation3: grey[200],
  elevation4: grey[300],
  menu: basic.white,
  menuElevation1: grey[50],
  menuElevation2: grey[100],
});
const vibrant = {
  listItemHover: cssVarRgba(common.whiteChannel, 0.5),
  buttonHover: cssVarRgba(common.whiteChannel, 0.7),
  textFieldHover: cssVarRgba(common.whiteChannel, 0.7),
  text: {
    secondary: alpha('#1B150F', 0.76),
    disabled: alpha('#1B150F', 0.4),
  },
  overlay: cssVarRgba(common.whiteChannel, 0.7),
};
const chGrey = grey;
const chRed = generatePaletteChannel(red);
const chSpruce = generatePaletteChannel(spruce);
const chGreen = generatePaletteChannel(green);
const chOrange = generatePaletteChannel(orange);
const chLightBlue = generatePaletteChannel(lightBlue);
const chBrown = generatePaletteChannel(brown);

export const lightPalette: PaletteOptions = {
  common,
  grey,
  primary,
  secondary,
  error,
  warning,
  success,
  info,
  neutral,
  action,
  divider,
  dividerLight,
  menuDivider,
  text,
  background,
  vibrant,
  chGrey,
  chRed,
  chSpruce,
  chGreen,
  chOrange,
  chLightBlue,
  chBrown,
};
