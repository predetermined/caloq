import { useEffect, useState } from "react";
import { AsyncStorage } from "react-native";

interface BehaviouralSettingsState {
  dailyKcalGoal?: number | null;
  /** Contains a goal which is only valid for a certain date. */
  todaysCustomKcalGoal?: {
    setForDate: string;
    goal: number;
  };
}

async function getState() {
  try {
    const behavioralSettingsString = await AsyncStorage.getItem(
      "behaviouralSettings"
    );
    if (!behavioralSettingsString) return null;

    return JSON.parse(behavioralSettingsString) as BehaviouralSettingsState;
  } catch {
    return null;
  }
}

export function useBehaviouralSettings() {
  const [dailyKcalGoal, _setDailyKcalGoal] = useState<null | number>(null);
  // Represents either the general daily kcal goal, or the custom kcal goal for today.
  const [todaysKcalGoal, _setTodaysKcalGoal] = useState<null | number>(null);

  async function loadState() {
    const state = await getState();

    _setDailyKcalGoal(state?.dailyKcalGoal ?? null);
    _setTodaysKcalGoal(
      state?.todaysCustomKcalGoal?.setForDate ===
        new Date().toLocaleDateString()
        ? state.todaysCustomKcalGoal.goal
        : state?.dailyKcalGoal ?? null
    );
  }

  useEffect(() => {
    loadState();
  }, []);

  async function setDailyKcalGoal(value: number | null) {
    // Also resets the custom kcal goal for today, if there's any.

    _setDailyKcalGoal(value);
    _setTodaysKcalGoal(value);

    const state = await getState();
    const newState: BehaviouralSettingsState = {
      ...state,
      dailyKcalGoal: value,
      todaysCustomKcalGoal: undefined,
    };

    await AsyncStorage.setItem("behaviouralSettings", JSON.stringify(newState));
  }

  async function setCustomKcalGoalForToday(value: number) {
    _setTodaysKcalGoal(value);

    const state = await getState();
    const newState: BehaviouralSettingsState = {
      ...state,
      todaysCustomKcalGoal: {
        goal: value,
        setForDate: new Date().toLocaleDateString(),
      },
    };

    await AsyncStorage.setItem("behaviouralSettings", JSON.stringify(newState));
  }

  return {
    todaysKcalGoal,
    dailyKcalGoal,
    setDailyKcalGoal,
    setCustomKcalGoalForToday,
  };
}
