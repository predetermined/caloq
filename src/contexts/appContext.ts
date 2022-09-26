import { createContext } from "react";
import { useHidingNumbers } from "../hooks/useHidingNumbers";
import { HistoryEntry, useHistory } from "../hooks/useHistory";
import { Meal, useMeals } from "../hooks/useMeals";
import { useNutrionalValuePreferences } from "../hooks/useNutrionalValuePreferences";

export interface IAppContext {
  history: ReturnType<typeof useHistory>;
  meals: ReturnType<typeof useMeals>;
  nutrionalValuePreferences: ReturnType<typeof useNutrionalValuePreferences>;
  hidingNumbers: ReturnType<typeof useHidingNumbers>;
}

export const AppContext = createContext({} as IAppContext);
