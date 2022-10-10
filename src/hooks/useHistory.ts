import { useEffect, useMemo, useState } from "react";
import { AsyncStorage } from "react-native";
import { Meal } from "./useMeals";
import {
  EMPTY_NUTRIONAL_VALUES_NUMBERS,
  OptionKey,
  OPTIONS,
} from "./useNutrionalValuePreferences";

export interface HistoryEntry extends Meal {
  dateReadable: string;
  dateIso: string;
}

export function uniqifyEntry(entry: HistoryEntry) {
  return JSON.stringify(entry);
}

export function getLastSundayDate(from = new Date()) {
  const lastSunday = new Date(
    from.getTime() - from.getDay() * 1000 * 60 * 60 * 24
  );
  lastSunday.setHours(0);
  lastSunday.setMinutes(0);
  lastSunday.setSeconds(0);
  lastSunday.setMilliseconds(0);
  return lastSunday;
}

export function getNextSundayDate(from = new Date()) {
  const nextSunday = new Date(
    from.getTime() + (6 - from.getDay()) * 1000 * 60 * 60 * 24
  );
  nextSunday.setHours(0);
  nextSunday.setMinutes(0);
  nextSunday.setSeconds(0);
  nextSunday.setMilliseconds(0);
  return nextSunday;
}

export function useHistory() {
  // Sorted ASC by date
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const historyString = await AsyncStorage.getItem("history");
      if (!historyString) return;

      const newHistory = JSON.parse(historyString) as HistoryEntry[];

      if (entries.length === newHistory.length) return;

      setEntries(
        newHistory.sort((e1, e2) =>
          new Date(e1.dateIso).getTime() < new Date(e2.dateIso).getTime()
            ? 1
            : -1
        )
      );
    } catch {}
  }

  const today = useMemo(() => {
    const dateReadable = new Date().toLocaleDateString();
    const historyToday = entries.filter(
      (entry) => entry.dateReadable === dateReadable
    );

    const sum = historyToday.reduce(
      (sum, entry) => {
        const updatedSum = sum;

        for (const _key in OPTIONS) {
          const key = _key as OptionKey;
          updatedSum[key] += entry[key] || 0;
        }

        return updatedSum;
      },
      { ...EMPTY_NUTRIONAL_VALUES_NUMBERS }
    );

    return {
      entries: historyToday,
      sum,
    };
  }, [entries.length]);

  const comparisonPeriods = useMemo(() => {
    const [last30Days, last7Days] = [30, 7].map((lastDaysToInclude) => {
      const minDate = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24 * lastDaysToInclude
      );

      const entriesWithinTimeFrame = entries.filter((entry) => {
        return new Date(entry.dateIso) >= minDate;
      });

      const sum = entriesWithinTimeFrame.reduce(
        (sum, entry) => {
          const updatedSum = sum;

          for (const _key in OPTIONS) {
            const key = _key as OptionKey;
            updatedSum[key] += entry[key] || 0;
          }

          return updatedSum;
        },
        { ...EMPTY_NUTRIONAL_VALUES_NUMBERS }
      );

      const uniqueDaysCount = [
        ...new Set(entriesWithinTimeFrame.map((entry) => entry.dateReadable)),
      ].length;

      const avg = Object.entries(sum).reduce(
        (avg, [key, value]) => {
          return {
            ...avg,
            [key]: value / Math.max(uniqueDaysCount, 1),
          };
        },
        { ...EMPTY_NUTRIONAL_VALUES_NUMBERS }
      );

      return {
        sum,
        avg,
      };
    });

    return {
      last30Days,
      last7Days,
    };
  }, [entries.length]);

  async function add(entry: HistoryEntry) {
    try {
      await AsyncStorage.setItem(
        "history",
        JSON.stringify([...entries, entry])
      );
    } catch {}
    await loadEntries();
  }

  async function addMany(newEntries: HistoryEntry[]) {
    try {
      await AsyncStorage.setItem(
        "history",
        JSON.stringify([...entries, ...newEntries])
      );
    } catch {}
    await loadEntries();
  }

  async function remove(dateIso: string) {
    const newEntries: HistoryEntry[] = [];

    for (const entry of entries) {
      if (entry.dateIso === dateIso) continue;
      newEntries.push(entry);
    }

    await AsyncStorage.setItem("history", JSON.stringify(newEntries));
    await loadEntries();
  }

  return {
    entries,
    today,
    comparisonPeriods,
    add,
    addMany,
    remove,
  };
}
