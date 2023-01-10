import { HistoryEntry } from "../hooks/useHistory";
import {
  EMPTY_NUTRIONAL_VALUES_NUMBERS,
  NUTRIONAL_METRICS,
  OptionKey,
} from "../hooks/useNutrionalValuePreferences";

export function calculateSum(entries: HistoryEntry[]) {
  return entries.reduce(
    (sum, entry) => {
      const updatedSum = sum;

      for (const _key in NUTRIONAL_METRICS) {
        const key = _key as OptionKey;
        updatedSum[key] += entry[key] || 0;
      }

      return updatedSum;
    },
    { ...EMPTY_NUTRIONAL_VALUES_NUMBERS }
  );
}
