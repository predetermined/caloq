import { useEffect, useMemo, useState } from "react";
import { AsyncStorage } from "react-native";
import { Meal } from "./useMeals";
import {
  EMPTY_NUTRIONAL_VALUES_NUMBERS,
  NUTRIONAL_METRICS,
  OptionKey,
} from "./useNutrionalValuePreferences";

export interface HistoryEntry extends Meal {
  dateReadable: string;
  dateIso: string;
}

export function uniqifyEntry(entry: HistoryEntry) {
  return JSON.stringify(entry);
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

        for (const _key in NUTRIONAL_METRICS) {
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

  function getAggregatedDataForPeriod(from: Date, until = new Date()) {
    const entriesWithinTimeFrame = entries.filter((entry) => {
      return new Date(entry.dateIso) >= from && new Date(entry.dateIso) < until;
    });

    const sum = entriesWithinTimeFrame.reduce(
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

    const uniqueDates = [
      ...new Set(entriesWithinTimeFrame.map((entry) => entry.dateReadable)),
    ];

    const avg = Object.entries(sum).reduce(
      (avg, [key, value]) => {
        return {
          ...avg,
          [key]: value / Math.max(uniqueDates.length, 1),
        };
      },
      { ...EMPTY_NUTRIONAL_VALUES_NUMBERS }
    );

    return {
      sum,
      avg,
      uniqueDates,
      entries: entriesWithinTimeFrame,
      dateGroups: uniqueDates.map((dateReadable) => {
        const matchingEntries = entriesWithinTimeFrame.filter(
          (entry) => entry.dateReadable === dateReadable
        );

        const sum = matchingEntries.reduce(
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

        return {
          sum,
        };
      }),
    };
  }

  return {
    entries,
    today,
    add,
    addMany,
    remove,
    getAggregatedDataForPeriod,
  };
}
