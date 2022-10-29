import { createContext } from "react";
import { useBehaviouralSettings } from "../hooks/useBehaviouralSettings";
import { useHidingNumbers } from "../hooks/useHidingNumbers";
import { useHistory } from "../hooks/useHistory";
import { useMeals } from "../hooks/useMeals";
import { useNutrionalValuePreferences } from "../hooks/useNutrionalValuePreferences";

export interface IAppContext {
  history: ReturnType<typeof useHistory>;
  meals: ReturnType<typeof useMeals>;
  nutrionalValuePreferences: ReturnType<typeof useNutrionalValuePreferences>;
  hidingNumbers: ReturnType<typeof useHidingNumbers>;
  behavioralSettings: ReturnType<typeof useBehaviouralSettings>;
}

export const AppContext = createContext({} as IAppContext);
