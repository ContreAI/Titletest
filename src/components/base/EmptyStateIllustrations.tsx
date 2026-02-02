import { SvgIcon, SvgIconProps } from '@mui/material';

/**
 * Pacific NW themed empty state illustrations
 * Using brand colors: Spruce (#264E36), Sea Glass (#9DBFBF), Mist (#F5F7F7), River Stone (#78909C)
 */

/** Evergreen trees - for deals/transactions empty state */
export const EmptyDealsIllustration = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 120 100" sx={{ width: 120, height: 100, ...props.sx }}>
    {/* Background mountains */}
    <path d="M0 80 L30 45 L60 70 L90 35 L120 60 L120 100 L0 100 Z" fill="#9DBFBF" opacity="0.3" />

    {/* Center evergreen tree */}
    <path d="M60 20 L45 50 L50 50 L40 70 L80 70 L70 50 L75 50 Z" fill="#264E36" opacity="0.8" />
    <rect x="56" y="70" width="8" height="12" fill="#6F4E37" opacity="0.6" />

    {/* Left smaller tree */}
    <path d="M25 40 L18 55 L21 55 L15 70 L35 70 L29 55 L32 55 Z" fill="#264E36" opacity="0.5" />
    <rect x="23" y="70" width="4" height="8" fill="#6F4E37" opacity="0.4" />

    {/* Right smaller tree */}
    <path d="M95 45 L88 58 L91 58 L85 70 L105 70 L99 58 L102 58 Z" fill="#264E36" opacity="0.5" />
    <rect x="93" y="70" width="4" height="8" fill="#6F4E37" opacity="0.4" />

    {/* Ground line */}
    <rect x="0" y="82" width="120" height="2" fill="#78909C" opacity="0.3" />
  </SvgIcon>
);

/** Document with mountain motif - for documents empty state */
export const EmptyDocumentsIllustration = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 100 100" sx={{ width: 100, height: 100, ...props.sx }}>
    {/* Document background */}
    <rect x="20" y="10" width="60" height="80" rx="4" fill="#F5F7F7" stroke="#9DBFBF" strokeWidth="2" />

    {/* Folded corner */}
    <path d="M65 10 L65 25 L80 25" fill="#F5F7F7" stroke="#9DBFBF" strokeWidth="2" />
    <path d="M65 10 L80 25 L65 25 Z" fill="#9DBFBF" opacity="0.3" />

    {/* Mountain illustration on document */}
    <path d="M30 60 L45 40 L55 50 L65 35 L80 55 L80 70 L30 70 Z" fill="#264E36" opacity="0.4" />

    {/* Text lines */}
    <rect x="30" y="75" width="40" height="3" rx="1" fill="#78909C" opacity="0.4" />
    <rect x="30" y="82" width="25" height="3" rx="1" fill="#78909C" opacity="0.3" />
  </SvgIcon>
);

/** River/water waves - for transactions empty state */
export const EmptyTransactionsIllustration = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 120 100" sx={{ width: 120, height: 100, ...props.sx }}>
    {/* Mountain backdrop */}
    <path d="M0 60 L40 25 L60 40 L100 15 L120 35 L120 100 L0 100 Z" fill="#264E36" opacity="0.2" />

    {/* River waves */}
    <path
      d="M0 70 Q15 65 30 70 T60 70 T90 70 T120 70"
      fill="none"
      stroke="#9DBFBF"
      strokeWidth="3"
      opacity="0.8"
    />
    <path
      d="M0 80 Q15 75 30 80 T60 80 T90 80 T120 80"
      fill="none"
      stroke="#9DBFBF"
      strokeWidth="2"
      opacity="0.5"
    />
    <path
      d="M0 90 Q15 85 30 90 T60 90 T90 90 T120 90"
      fill="none"
      stroke="#9DBFBF"
      strokeWidth="2"
      opacity="0.3"
    />

    {/* Small boat/arrow suggesting flow */}
    <path d="M55 65 L65 60 L65 70 Z" fill="#78909C" opacity="0.6" />
  </SvgIcon>
);

/** Generic empty state with Pacific NW motif */
export const EmptyGenericIllustration = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 100 100" sx={{ width: 100, height: 100, ...props.sx }}>
    {/* Circle background */}
    <circle cx="50" cy="50" r="45" fill="#F5F7F7" stroke="#9DBFBF" strokeWidth="2" />

    {/* Simplified mountain/tree silhouette */}
    <path d="M25 70 L50 30 L75 70 Z" fill="#264E36" opacity="0.4" />
    <circle cx="50" cy="55" r="8" fill="#9DBFBF" opacity="0.6" />
  </SvgIcon>
);

export default {
  EmptyDealsIllustration,
  EmptyDocumentsIllustration,
  EmptyTransactionsIllustration,
  EmptyGenericIllustration,
};
