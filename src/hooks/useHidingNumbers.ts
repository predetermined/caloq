import { useEffect, useState } from "react";
import { AsyncStorage } from "react-native";

export function useHidingNumbers() {
  const [isHiding, setIsHiding] = useState(false);

  async function loadState() {
    setIsHiding(!!(await AsyncStorage.getItem("isHidingNumbers")));
  }

  useEffect(() => {
    loadState();
  }, []);

  async function toggle() {
    if (isHiding) {
      AsyncStorage.removeItem("isHidingNumbers");
    } else {
      AsyncStorage.setItem("isHidingNumbers", "1");
    }

    await loadState();
  }

  return {
    isHiding,
    toggle,
  };
}
