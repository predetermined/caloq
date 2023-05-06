import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { OptionKey } from "./useNutrionalValuePreferences";

export type Meal = Record<OptionKey, number>;

export type MealAsObject = { name: string } & Meal;

export function useMeals() {
  const mealsStorage = useAsyncStorage("meals");
  const [entries, setEntries] = useState<Record<string, Meal>>({
    Oatmeal: { kcal: 372, protein: 14, sugar: 1, fat: 7, fiber: 10, carbs: 59 },
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const mealsString = await mealsStorage.getItem();
      if (!mealsString) return;

      setEntries(JSON.parse(mealsString));
    } catch {}
  }

  async function add(meal: MealAsObject) {
    try {
      const { name, ...values } = meal;
      await mealsStorage.setItem(
        JSON.stringify({ ...entries, [name]: values })
      );
    } catch {}
    await loadEntries();
  }

  async function addMany(meals: MealAsObject[]) {
    try {
      const insert = { ...entries };

      for (const meal of meals) {
        const { name, ...values } = meal;
        insert[name] = values;
      }

      await mealsStorage.setItem(JSON.stringify(insert));
    } catch {}
    await loadEntries();
  }

  async function remove(key: string) {
    const newMeals: Record<string, Meal> = {};

    for (const mealKey of Object.keys(entries)) {
      if (mealKey === key) continue;
      newMeals[mealKey] = entries[mealKey];
    }

    await mealsStorage.setItem(JSON.stringify(newMeals));
    await loadEntries();
  }

  async function moveUpInOrder(key: string) {
    const currentIndex = Object.keys(entries).indexOf(key);
    const newKeyOrder = Object.keys(entries);
    const temp = Object.keys(entries)[currentIndex - 1];
    newKeyOrder[currentIndex] = temp;
    newKeyOrder[currentIndex - 1] = key;

    const newEntries: Record<string, Meal> = {};
    for (const mealKey of newKeyOrder) {
      newEntries[mealKey] = entries[mealKey];
    }

    await mealsStorage.setItem(JSON.stringify(newEntries));
    await loadEntries();
  }

  return {
    entries,
    add,
    addMany,
    remove,
    moveUpInOrder,
  };
}
