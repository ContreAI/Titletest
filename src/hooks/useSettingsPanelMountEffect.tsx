import { useEffect, useRef } from 'react';
import { Config } from 'config';
import { SettingsPanelConfig, useSettingsPanelContext } from 'providers/SettingsPanelProvider';

const useSettingsPanelMountEffect = (effects: Partial<SettingsPanelConfig>) => {
  const { settingsPanelConfig, setSettingsPanelConfig } = useSettingsPanelContext();
  // Use ref to capture initial config values at mount time
  const initialConfigRef = useRef(settingsPanelConfig);

  useEffect(() => {
    setSettingsPanelConfig(effects);
    const undoEffects = Object.keys(effects).reduce((acc, effect) => {
      // @ts-ignore
      acc[effect] = initialConfigRef.current[effect as keyof Config];
      return acc;
    }, {} as Partial<SettingsPanelConfig>);
    return () => {
      setSettingsPanelConfig(undoEffects);
    };
  }, [effects, setSettingsPanelConfig]);
};

export default useSettingsPanelMountEffect;
