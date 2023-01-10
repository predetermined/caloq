import { useState } from "react";
import { tw } from "../lib/tw";

export const EMPTY_NUTRIONAL_VALUES_STRINGS: Record<OptionKey, string> = {
  kcal: "",
  protein: "",
  sugar: "",
  fat: "",
  fiber: "",
  carbs: "",
} as const;

export const EMPTY_NUTRIONAL_VALUES_NUMBERS: Record<OptionKey, number> = {
  kcal: 0,
  protein: 0,
  sugar: 0,
  fat: 0,
  fiber: 0,
  carbs: 0,
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
} as const;

export type OptionKey = keyof typeof NUTRIONAL_METRICS;

export function useNutrionalValuePreferences() {
  const [enabledValues, setEnabledValues] = useState<OptionKey[]>([
    "kcal",
    "protein",
    "sugar",
  ]);

  function enable(key: OptionKey) {
    setEnabledValues([...enabledValues.filter((_key) => _key !== key), key]);
  }

  function disable(key: OptionKey) {
    setEnabledValues([...enabledValues].filter((_key) => _key !== key));
  }

  return {
    enabledValues,
    enable,
    disable,
  };
}
