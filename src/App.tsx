import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerRootComponent } from "expo";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import { Navigation } from "./navigation/Navigation";
import { AppContext } from "./contexts/appContext";
import { useHistory } from "./hooks/useHistory";
import { useMeals } from "./hooks/useMeals";
import { useNutrionalValuePreferences } from "./hooks/useNutrionalValuePreferences";
import { useHidingNumbers } from "./hooks/useHidingNumbers";
import { useBehaviouralSettings } from "./hooks/useBehaviouralSettings";

export function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const history = useHistory();
  const meals = useMeals();
  const nutrionalValuePreferences = useNutrionalValuePreferences();
  const hidingNumbers = useHidingNumbers();
  const behavioralSettings = useBehaviouralSettings();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider style={{ paddingTop: 0 }}>
        <AppContext.Provider
          value={{
            history,
            meals,
            nutrionalValuePreferences,
            hidingNumbers,
            behavioralSettings,
          }}
        >
          <Navigation colorScheme={colorScheme} />
        </AppContext.Provider>
      </SafeAreaProvider>
    );
  }
}

export default registerRootComponent(App);
