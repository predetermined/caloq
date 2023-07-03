import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { tw } from "../lib/tw";

export const EMPTY_NUTRIONAL_VALUES_STRINGS: Record<OptionKey, string> = {
  kcal: "",
  fat: "",
  carbs: "",
  fiber: "",
  sugar: "",
  protein: "",
} as const;

export const EMPTY_NUTRIONAL_VALUES_NUMBERS: Record<OptionKey, number> = {
  kcal: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sugar: 0,
  protein: 0,
} as const;

export const NUTRIONAL_METRICS = {
  kcal: {
    label: "Kcal",
    representation: {
      color: tw.color("indigo-500"),
      iconName: "flash",
      valueRelated: {
        unit: "",
        suffix: "kcal",
      },
    },
  },
  fat: {
    label: "Grams of fat",
    representation: {
      color: tw.color("orange-400"),
      iconName: "barbell",
      valueRelated: {
        unit: "g",
        suffix: "fat",
      },
    },
  },
  carbs: {
    label: "Grams of carbs",
    representation: {
      color: tw.color("orange-400"),
      iconName: "barbell",
      valueRelated: {
        unit: "g",
        suffix: "carbs",
      },
    },
  },
  fiber: {
    label: "Grams of fiber",
    representation: {
      color: tw.color("orange-400"),
      iconName: "barbell",
      valueRelated: {
        unit: "g",
        suffix: "fiber",
      },
    },
  },
  sugar: {
    label: "Grams of sugar",
    representation: {
      color: tw.color("gray-800"),
      iconName: "barbell",
      valueRelated: {
        unit: "g",
        suffix: "sugar",
      },
    },
  },
  protein: {
    label: "Grams of protein",
    representation: {
      color: tw.color("indigo-300"),
      iconName: "barbell",
      valueRelated: {
        unit: "g",
        suffix: "protein",
      },
    },
  },
} as const;

export type OptionKey = keyof typeof NUTRIONAL_METRICS;

export function useNutrionalValuePreferences() {
  const nutrionalValuePreferencesStorage = useAsyncStorage(
    "nutrionalValuePreferences"
  );
  const [enabledValues, setEnabledValues] = useState<OptionKey[]>([
    "kcal",
    "sugar",
    "protein",
  ]);

  async function loadState() {
    try {
      const nutrionalValuePreferencesString =
        await nutrionalValuePreferencesStorage.getItem();
      if (!nutrionalValuePreferencesString) return;

      setEnabledValues(JSON.parse(nutrionalValuePreferencesString));
    } catch {}
  }

  useEffect(() => {
    loadState();
  }, []);

  async function enable(key: OptionKey) {
    const newState = [
      ...enabledValues.filter((_key) => _key !== key),
      key,
    ].sort((a, b) =>
      Object.keys(NUTRIONAL_METRICS).indexOf(a) <
      Object.keys(NUTRIONAL_METRICS).indexOf(b)
        ? -1
        : 1
    );

    setEnabledValues(newState);
    await nutrionalValuePreferencesStorage.setItem(JSON.stringify(newState));
  }

  async function disable(key: OptionKey) {
    const newState = [...enabledValues].filter((_key) => _key !== key);

    setEnabledValues(newState);
    await nutrionalValuePreferencesStorage.setItem(JSON.stringify(newState));
  }

  return {
    enabledValues: enabledValues,
    enable,
    disable,
  };
}
