import { useEffect, useState } from "react";
import { AsyncStorage } from "react-native";

export function useBehaviouralSettings() {
  const [warnAfterKcalPerDay, _setWarnAfterKcalPerDay] = useState<
    null | number
  >(null);

  async function loadState() {
    try {
      const behavioralSettingsString = await AsyncStorage.getItem(
        "behaviouralSettings"
      );
      if (!behavioralSettingsString) return;

      const { warnAfterKcalPerDay } = JSON.parse(behavioralSettingsString);
      _setWarnAfterKcalPerDay(warnAfterKcalPerDay);
    } catch {}
  }

  useEffect(() => {
    loadState();
  }, []);

  async function setWarnAfterKcalPerDay(value: typeof warnAfterKcalPerDay) {
    _setWarnAfterKcalPerDay(value);
    await AsyncStorage.setItem(
      "behaviouralSettings",
      JSON.stringify({
        warnAfterKcalPerDay: value,
      })
    );
  }

  return {
    warnAfterKcalPerDay,
    setWarnAfterKcalPerDay,
  };
}
