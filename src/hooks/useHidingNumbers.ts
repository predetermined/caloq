import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useHidingNumbers() {
  const isHidingNumbersStorage = useAsyncStorage("isHidingNumbers");
  const [isHiding, setIsHiding] = useState(false);

  async function loadState() {
    setIsHiding(!!(await isHidingNumbersStorage.getItem()));
  }

  useEffect(() => {
    loadState();
  }, []);

  async function toggle() {
    if (isHiding) {
      isHidingNumbersStorage.removeItem();
    } else {
      isHidingNumbersStorage.setItem("1");
    }

    await loadState();
  }

  return {
    isHiding,
    toggle,
  };
}
