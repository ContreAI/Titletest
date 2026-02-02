import { PaletteOptions } from '@mui/material/styles';
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

const neutral = generatePaletteChannel({
  lighter: grey[900],
  light: grey[800],
  main: grey[300],
  dark: grey[200],
  darker: grey[100],
  contrastText: grey[950],
});
const primary = generatePaletteChannel({
  lighter: spruce[950],
  light: spruce[700],
  main: spruce[400],
  dark: spruce[300],
  darker: spruce[100],
  contrastText: spruce[950],
});
const secondary = generatePaletteChannel({
  lighter: purple[950],
  light: purple[700],
  main: purple[400],
  dark: purple[300],
  darker: purple[100],
  contrastText: purple[950],
});
const error = generatePaletteChannel({
  lighter: red[950],
  light: red[600],
  main: red[400],
  dark: red[300],
  darker: red[200],
  contrastText: red[950],
});
const warning = generatePaletteChannel({
  lighter: orange[950],
  light: orange[800],
  main: orange[400],
  dark: orange[300],
  darker: orange[200],
  contrastText: orange[950],
  text: orange[300], // Light shade for text on dark backgrounds (good contrast)
});
const success = generatePaletteChannel({
  lighter: green[950],
  light: green[700],
  main: green[400],
  dark: green[300],
  darker: green[200],
  contrastText: green[950],
});
const info = generatePaletteChannel({
  lighter: lightBlue[950],
  light: lightBlue[700],
  main: lightBlue[400],
  dark: lightBlue[300],
  darker: lightBlue[200],
  contrastText: lightBlue[950],
});

const action = generatePaletteChannel({
  active: grey[500],
  hover: grey[700],
  selected: grey[900],
  disabled: grey[500],
  disabledBackground: grey[700],
  focus: grey[700],
});

const divider = grey[700];
const menuDivider = grey[700];
const dividerLight = grey[800];
const text = generatePaletteChannel({
  primary: grey[100],      // Light text for dark mode
  secondary: grey[300],    // Lighter grey for secondary text in dark mode
  disabled: grey[500],     // Disabled text in dark mode
  tertiary: grey[400],     // Tertiary text in dark mode
});
const background = generatePaletteChannel({
  default: grey[950],
  paper: grey[950],
  neutral: grey[900],      // Neutral background for dark mode
  subtle: grey[850],       // Subtle background for dark mode
  elevation0: grey[950],
  elevation1: grey[900],
  elevation2: grey[800],
  elevation3: grey[700],
  elevation4: grey[600],
  menu: grey[900],
  menuElevation1: grey[800],
  menuElevation2: grey[700],
});
const vibrant = {
  listItemHover: cssVarRgba(common.whiteChannel, 0.1),
  buttonHover: cssVarRgba(common.whiteChannel, 0.1),
  textFieldHover: cssVarRgba(common.whiteChannel, 0.1),
  text: {
    secondary: cssVarRgba(common.whiteChannel, 0.7),
    disabled: cssVarRgba(common.whiteChannel, 0.5),
  },
  overlay: cssVarRgba(common.whiteChannel, 0),
};

const chGrey = generatePaletteChannel({
  50: grey[900],
  100: grey[800],
  200: grey[700],
  300: grey[600],
  400: grey[500],
  500: grey[400],
  600: grey[300],
  700: grey[200],
  800: grey[100],
  900: grey[50],
  950: common.white,
});
const chRed = generatePaletteChannel({
  50: red[950],
  100: red[800],
  200: red[700],
  300: red[600],
  400: red[500],
  500: red[400],
  600: red[300],
  700: red[200],
  800: red[100],
  900: red[50],
  950: common.white,
});
const chSpruce = generatePaletteChannel({
  50: spruce[950],
  100: spruce[800],
  200: spruce[700],
  300: spruce[600],
  400: spruce[500],
  500: spruce[400],
  600: spruce[300],
  700: spruce[200],
  800: spruce[100],
  900: spruce[50],
  950: common.white,
});
const chGreen = generatePaletteChannel({
  50: green[950],
  100: green[800],
  200: green[700],
  300: green[600],
  400: green[500],
  500: green[400],
  600: green[300],
  700: green[200],
  800: green[100],
  900: green[50],
  950: common.white,
});
const chOrange = generatePaletteChannel({
  50: orange[950],
  100: orange[800],
  200: orange[700],
  300: orange[600],
  400: orange[500],
  500: orange[400],
  600: orange[300],
  700: orange[200],
  800: orange[100],
  900: orange[50],
  950: common.white,
});
const chLightBlue = generatePaletteChannel({
  50: lightBlue[950],
  100: lightBlue[800],
  200: lightBlue[700],
  300: lightBlue[600],
  400: lightBlue[500],
  500: lightBlue[400],
  600: lightBlue[300],
  700: lightBlue[200],
  800: lightBlue[100],
  900: lightBlue[50],
  950: common.white,
});
const chBrown = generatePaletteChannel({
  50: brown[950],
  100: brown[800],
  200: brown[700],
  300: brown[600],
  400: brown[500],
  500: brown[400],
  600: brown[300],
  700: brown[200],
  800: brown[100],
  900: brown[50],
  950: common.white,
});

export const darkPalette: PaletteOptions = {
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
