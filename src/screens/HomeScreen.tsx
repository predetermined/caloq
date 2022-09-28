import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Pressable,
  Keyboard,
  ScrollView,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { StyledText } from "../components/StyledText";
import {
  defaultBorderColor,
  defaultBorderRadius,
  defaultFontSize,
  endPadding,
  sharedColors,
  sharedStyles,
} from "../constants/layout";
import { RootTabScreenProps } from "../types";
import { AppContext, IAppContext } from "../contexts/appContext";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledTextInput } from "../components/StyledTextInput";
import {
  EMPTY_NUTRIONAL_VALUES_STRINGS,
  OptionKey,
  OPTIONS,
} from "../hooks/useNutrionalValuePreferences";

const styles = StyleSheet.create({
  tab: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: sharedColors.gray[1],
    borderTopLeftRadius: defaultBorderRadius,
    borderTopRightRadius: defaultBorderRadius,
    zIndex: -1,
  },
  activeTab: {
    backgroundColor: "#dc2626",
    color: "white",
    paddingTop: 11,
    paddingBottom: 11,
    zIndex: 30,
  },
  tabText: {
    fontSize: 12,
  },
  activeTabText: {
    color: "white",
  },
});

export function getDisplayNumbers(
  values: IAppContext["history"]["today"]["sum"]
) {
  const max = Object.keys(OPTIONS)
    .map((key) => Math.round(values[key as OptionKey]))
    .map(String)
    .reduce((max, s) => {
      if (s.length > max) {
        return s.length;
      }

      return max;
    }, 0);

  return Object.keys(OPTIONS).reduce((ret, _key) => {
    const key = _key as OptionKey;
    const stringValue = String(values[key] ?? "0");

    return {
      ...ret,
      [key]: "0".repeat(max - stringValue.length) + stringValue,
    };
  }, {} as Record<OptionKey, string>);
}

export function HomeScreen(_props: RootTabScreenProps<"Home">) {
  const { meals, history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  const [addManually, setAddManually] = useState(false);
  const [grams, setGrams] = useState("");
  const [nutrionalValues, setNutrionalValues] = useState<
    Record<OptionKey, string>
  >(EMPTY_NUTRIONAL_VALUES_STRINGS);
  const [pickerValue, setPickerValue] = useState("NONE");

  function resetValues() {
    setNutrionalValues(EMPTY_NUTRIONAL_VALUES_STRINGS);
    setGrams("");
    setPickerValue("NONE");
  }

  const getValuesThatAreBeingAdded = useCallback(() => {
    const fakeGrams = addManually ? 100 : Number(grams) ?? 0;

    return Object.keys(OPTIONS).reduce((values, _key) => {
      const key = _key as OptionKey;
      const n = Number.isNaN(Number(nutrionalValues[key]))
        ? 0
        : Number(nutrionalValues[key]);

      return {
        ...values,
        [key]: Math.round(fakeGrams * (n / 100)),
      };
    }, {}) as Record<OptionKey, number>;
  }, [addManually, nutrionalValues, grams]);

  const valuesThatAreBeingAdded = useMemo(() => {
    return getValuesThatAreBeingAdded();
  }, [getValuesThatAreBeingAdded]);

  async function add() {
    const values = getValuesThatAreBeingAdded();
    const date = new Date();

    await history.add({
      ...values,
      dateIso: date.toISOString(),
      dateReadable: date.toLocaleDateString(),
    });

    resetValues();
    Keyboard.dismiss();
  }

  function selectMeal(mealKey: keyof typeof meals["entries"] | "NONE") {
    setPickerValue(mealKey);
    Keyboard.dismiss();

    if (mealKey === "NONE") {
      resetValues();
      return;
    }

    const meal = meals.entries[mealKey];

    const stringMeal = {} as Record<keyof typeof meal, string>;
    for (const [key, value] of Object.entries(meal)) {
      stringMeal[key as OptionKey] = String(value);
    }

    setNutrionalValues(stringMeal);
  }

  const displayNumbers = useMemo(() => {
    return getDisplayNumbers(history.today.sum);
  }, [history.today.sum]);

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{
          ...sharedStyles.screenView,
          backgroundColor: sharedColors.gray[1],
        }}
      >
        <View
          style={{
            ...sharedStyles.section,
            ...sharedStyles.titleView,
            backgroundColor: "white",
          }}
        >
          <StyledText style={sharedStyles.screenTitle}>
            New
            {"\n"}
            entry
          </StyledText>

          <Pressable>
            <StyledText
              style={{
                fontSize: 7,
              }}
            >
              {nutrionalValuePreferences.enabledValues.map((key, i) => {
                return (
                  <StyledText key={key}>
                    {i === 0 ? null : "\n"}
                    {(hidingNumbers.isHiding ? "X" : displayNumbers[key]) +
                      OPTIONS[key].representation.valueRelated.unit +
                      " "}
                    {key === "kcal" ? (
                      <StyledText style={{ color: "white" }}>.</StyledText>
                    ) : null}
                    {OPTIONS[key].representation.valueRelated.suffix}
                  </StyledText>
                );
              })}
            </StyledText>
          </Pressable>
        </View>

        <View style={{ backgroundColor: "white" }}>
          <View
            style={{
              ...sharedStyles.section,
              marginTop: 15,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              marginLeft: 10,
              marginBottom: -1,
              zIndex: 0,
            }}
          >
            <Pressable
              style={{
                ...styles.tab,
                ...(!addManually ? styles.activeTab : { marginRight: -1 }),
              }}
              onPress={() => {
                setAddManually(false);
                resetValues();
              }}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                foreground: true,
              }}
            >
              <StyledText
                style={{
                  ...styles.tabText,
                  ...(!addManually ? styles.activeTabText : {}),
                }}
              >
                By weight
              </StyledText>
            </Pressable>

            <Pressable
              style={{
                ...styles.tab,
                ...(addManually ? styles.activeTab : { marginLeft: -1 }),
              }}
              onPress={() => {
                setAddManually(true);
                resetValues();
              }}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                foreground: true,
              }}
            >
              <StyledText
                style={{
                  ...styles.tabText,
                  ...(addManually ? styles.activeTabText : {}),
                }}
              >
                By direct values
              </StyledText>
            </Pressable>
          </View>

          <View style={sharedStyles.section}>
            <View
              style={{
                borderWidth: 1,
                borderColor: sharedColors.gray[2],
                padding: 15,
                borderRadius: defaultBorderRadius,
                elevation: 7,
                backgroundColor: "white",
                shadowColor: "rgba(0, 0, 0, 0.25)",
              }}
            >
              {addManually ? (
                <>
                  {nutrionalValuePreferences.enabledValues.map((key, i) => {
                    return (
                      <View
                        key={key}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginTop: i === 0 ? 0 : 15,
                        }}
                      >
                        <StyledText style={sharedStyles.labelText}>
                          {OPTIONS[key].label}
                        </StyledText>
                        <StyledTextInput
                          value={nutrionalValues[key]}
                          onChangeText={(value) =>
                            setNutrionalValues({
                              ...nutrionalValues,
                              [key]: value,
                            })
                          }
                          style={sharedStyles.textInput}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      </View>
                    );
                  })}
                </>
              ) : (
                <>
                  <View>
                    <StyledText style={sharedStyles.labelText}>
                      Grams
                    </StyledText>
                    <StyledTextInput
                      value={grams}
                      onChangeText={(value) => setGrams(value)}
                      style={sharedStyles.textInput}
                      placeholder="100"
                      keyboardType="numeric"
                    />
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: 15,
                    }}
                  >
                    <StyledText style={sharedStyles.labelText}>
                      Nutrional values per 100g
                    </StyledText>

                    <View
                      style={{
                        borderRadius: defaultBorderRadius,
                        borderWidth: 1,
                        borderColor: defaultBorderColor,
                        padding: 15,
                      }}
                    >
                      {meals.isLoading ? (
                        <StyledText>Loading...</StyledText>
                      ) : (
                        <View
                          style={{
                            height: 40,
                            overflow: "hidden",
                            borderRadius: defaultBorderRadius,
                          }}
                        >
                          <Picker
                            style={{
                              paddingLeft: 7,
                              backgroundColor: sharedColors.gray[8],
                              color: sharedColors.gray[3],
                              fontSize: defaultFontSize,
                              marginTop: -8,
                            }}
                            dropdownIconColor={sharedColors.gray[3]}
                            selectedValue={pickerValue}
                            onValueChange={selectMeal}
                          >
                            <Picker.Item
                              label="Choose meal..."
                              value={"NONE"}
                            />
                            {Object.keys(meals.entries).map((mealKey) => {
                              return (
                                <Picker.Item
                                  key={mealKey}
                                  label={mealKey}
                                  value={mealKey}
                                />
                              );
                            })}
                          </Picker>
                        </View>
                      )}

                      {nutrionalValuePreferences.enabledValues.map((key) => {
                        return (
                          <View
                            key={key}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: 15,
                            }}
                          >
                            <StyledText
                              style={{
                                ...sharedStyles.labelText,
                                marginRight: 15,
                                marginBottom: 0,
                                width: "25%",
                              }}
                            >
                              {OPTIONS[key].label}
                            </StyledText>
                            <StyledTextInput
                              value={nutrionalValues[key]}
                              onChangeText={(value) =>
                                setNutrionalValues({
                                  ...nutrionalValues,
                                  [key]: value,
                                })
                              }
                              style={{
                                ...sharedStyles.textInput,
                                width: "65%",
                              }}
                              placeholder="0"
                              keyboardType="numeric"
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}

              <StyledText
                style={{
                  marginTop: 15,
                  display: "flex",
                  justifyContent: "center",
                  fontSize: 8,
                  lineHeight: 11,
                  color: "#888",
                  textAlign: "center",
                }}
              >
                {nutrionalValuePreferences.enabledValues.map((key, i) => {
                  return (
                    <StyledText key={key}>
                      {i === 0 ? null : " • "}
                      <StyledText style={{ color: "black" }}>
                        {hidingNumbers.isHiding
                          ? "X"
                          : valuesThatAreBeingAdded[key]}
                        {OPTIONS[key].representation.valueRelated.unit}
                      </StyledText>{" "}
                      {OPTIONS[key].representation.valueRelated.suffix}
                    </StyledText>
                  );
                })}
              </StyledText>

              <Pressable
                onPress={add}
                style={{ marginTop: 7, ...sharedStyles.button }}
                android_ripple={{
                  color: sharedColors.gray[5],
                  foreground: true,
                }}
              >
                <StyledText
                  style={{
                    color: "white",
                    fontSize: defaultFontSize,
                    textAlign: "center",
                  }}
                >
                  Add
                </StyledText>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              marginTop: 30,
              transform: [{ rotate: "4deg" }],
              backgroundColor: sharedColors.gray[1],
              height: 40,
              width: "120%",
              marginLeft: -20,
              marginBottom: -15,
              zIndex: -1,
            }}
          />

          <View
            style={{
              ...sharedStyles.section,
              backgroundColor: sharedColors.gray[1],
              paddingBottom: endPadding,
            }}
          >
            {history.today.entries.map((entry) => {
              return (
                <HistoryEntry
                  key={entry.dateIso}
                  entry={entry}
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
