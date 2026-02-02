import { ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { FormControlLabel } from '@mui/material';
import { Radio } from '@mui/material';
import ltrdark from 'assets/images/sections/settings-panel/ltr-dark.webp';
import ltr from 'assets/images/sections/settings-panel/ltr.webp';
import rtlDark from 'assets/images/sections/settings-panel/rtl-dark.webp';
import rtl from 'assets/images/sections/settings-panel/rtl.webp';
import { TextDirection } from 'config';
import { useSettingsContext } from 'providers/SettingsProvider';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';

const TextDirectionPanel = () => {
  const {
    config: { textDirection },
    setConfig,
  } = useSettingsContext();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    navigate(location.pathname, { replace: true });
    setConfig({
      textDirection: (event.target as HTMLInputElement).value as TextDirection,
    });
  };

  return (
    <SettingsPanelRadioGroup name="text-direction" value={textDirection} onChange={handleChange}>
      <FormControlLabel
        value="ltr"
        control={<Radio />}
        label={
          <SettingsItem
            label="LTR"
            image={{ light: ltr, dark: ltrdark }}
            active={textDirection === 'ltr'}
          />
        }
      />
      <FormControlLabel
        value="rtl"
        control={<Radio />}
        label={
          <SettingsItem
            label="RTL"
            image={{ light: rtl, dark: rtlDark }}
            active={textDirection === 'rtl'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TextDirectionPanel;
