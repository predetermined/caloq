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
  defaultBorderRadius,
  defaultFontSize,
  endPadding,
  firstElementTopMargin,
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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  tab: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: sharedColors.gray[0],
    borderTopLeftRadius: defaultBorderRadius,
    borderTopRightRadius: defaultBorderRadius,
    zIndex: -1,
    elevation: 4,
    shadowColor: "rgba(0, 0, 0, 0.1)",
  },
  activeTab: {
    backgroundColor: "#dc2626",
    color: "white",
    paddingTop: 13,
    paddingBottom: 13,
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

export function HomeScreen(props: RootTabScreenProps<"Home">) {
  const {
    meals,
    history,
    nutrionalValuePreferences,
    hidingNumbers,
    behavioralSettings,
  } = useContext(AppContext);
  const navigation = useNavigation();

  const [addManually, setAddManually] = useState(false);
  const [grams, setGrams] = useState("");
  const [nutrionalValues, setNutrionalValues] = useState<
    Record<OptionKey, string>
  >(EMPTY_NUTRIONAL_VALUES_STRINGS);
  const [pickerValue, setPickerValue] = useState("NONE");
  const [
    didAlreadyConfirmWarningContinue,
    setDidAlreadyConfirmWarningContinue,
  ] = useState(false);

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
    setDidAlreadyConfirmWarningContinue(false);
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

  const shouldShowWarning = useMemo(() => {
    return (
      !didAlreadyConfirmWarningContinue &&
      behavioralSettings.warnAfterKcalPerDay &&
      history.today.sum.kcal >= behavioralSettings.warnAfterKcalPerDay
    );
  }, [
    didAlreadyConfirmWarningContinue,
    behavioralSettings.warnAfterKcalPerDay,
    history.today.sum.kcal,
  ]);

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        style={{
          ...sharedStyles.screenView,
        }}
      >
        <View
          style={{
            ...sharedStyles.section,
            ...sharedStyles.titleView,
            justifyContent: "flex-end",
            zIndex: 1,
            marginTop: firstElementTopMargin,
          }}
        >
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

        <View style={{ marginTop: -30 }}>
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
                padding: 20,
                borderRadius: defaultBorderRadius,
                backgroundColor: "white",
                elevation: 16,
                shadowColor: "rgba(0, 0, 0, 0.3)",
                overflow: "hidden",
              }}
            >
              {shouldShowWarning ? (
                <View
                  style={{
                    padding: 20,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "white",
                    justifyContent: "center",
                    zIndex: 1,
                    overflow: "hidden",
                  }}
                >
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 15,
                      }}
                    >
                      <Ionicons
                        style={{ color: sharedColors.red }}
                        size={48}
                        name="warning"
                      />

                      <StyledText
                        style={{
                          marginLeft: 15,
                          fontSize: 16,
                          lineHeight: 22,
                          flex: 1,
                        }}
                      >
                        You reached your set warning value. Are you sure you
                        would like to continue?
                      </StyledText>
                    </View>

                    <Pressable
                      style={{ ...sharedStyles.button }}
                      onPress={() => setDidAlreadyConfirmWarningContinue(true)}
                    >
                      <StyledText
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Continue anyway
                      </StyledText>
                    </Pressable>
                  </View>
                </View>
              ) : null}

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
                      }}
                    >
                      <View
                        style={{
                          height: 44,
                          overflow: "hidden",
                          borderRadius: defaultBorderRadius,
                          flex: 1,
                          borderWidth: 0.75,
                          borderColor: sharedColors.gray[2],
                          paddingTop: 3,
                        }}
                      >
                        <Picker
                          style={{
                            paddingLeft: 8,
                            backgroundColor: sharedColors.gray[1],
                            fontSize: 11,
                            marginTop: -8,
                            marginRight: -10,
                          }}
                          dropdownIconColor={sharedColors.gray[5]}
                          dropdownIconRippleColor="transparent"
                          selectedValue={pickerValue}
                          onValueChange={selectMeal}
                        >
                          <Picker.Item
                            label="Choose meal..."
                            value={"NONE"}
                            style={{
                              fontSize: defaultFontSize,
                            }}
                          />
                          {Object.keys(meals.entries).map((mealKey) => {
                            return (
                              <Picker.Item
                                key={mealKey}
                                label={mealKey}
                                value={mealKey}
                                style={{
                                  fontSize: defaultFontSize,
                                }}
                              />
                            );
                          })}
                        </Picker>
                      </View>

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
                                fontSize: 11,
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
                                fontSize: 12,
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
              ...sharedStyles.section,
              paddingBottom: endPadding,
              marginTop: 10,
            }}
          >
            {history.today.entries.map((entry) => {
              return <HistoryEntry key={entry.dateIso} entry={entry} />;
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
