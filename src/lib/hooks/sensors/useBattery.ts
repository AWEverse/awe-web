import { useState, useEffect } from 'react';

interface BatteryStatus {
  level: number | null;
  charging: boolean | null;
  supported: boolean;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
  getBattery: () => Promise<BatteryManager>;
}

export const useBatteryStatus = () => {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: null,
    charging: null,
    supported: 'getBattery' in navigator,
  });

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      return;
    }

    let battery: BatteryManager;

    const updateBatteryStatus = () => {
      setBatteryStatus({
        level: battery.level * 100,
        charging: battery.charging,
        supported: true,
      });
    };

    (navigator as unknown as BatteryManager).getBattery().then((bat: BatteryManager) => {
      battery = bat;
      updateBatteryStatus();

      // Event listeners for battery changes
      battery.addEventListener('levelchange', updateBatteryStatus);
      battery.addEventListener('chargingchange', updateBatteryStatus);
    });

    return () => {
      // Clean up event listeners when component is unmounted
      if (battery) {
        battery.removeEventListener('levelchange', updateBatteryStatus);
        battery.removeEventListener('chargingchange', updateBatteryStatus);
      }
    };
  }, []);

  return batteryStatus;
};
