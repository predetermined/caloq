import { useContext, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { DefaultEntry } from "../components/Entry";
import { StyledText } from "../components/StyledText";
import { StyledTextInput } from "../components/StyledTextInput";
import {
  defaultBorderColor,
  defaultBorderRadius,
  defaultFontSize,
  endPadding,
  sharedColors,
  sharedStyles,
} from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import {
  EMPTY_NUTRIONAL_VALUES_STRINGS,
  OptionKey,
  OPTIONS,
} from "../hooks/useNutrionalValuePreferences";
import { parseValuesToNumbers } from "../lib/parseValuesToNumbers";
import { Ionicons } from "@expo/vector-icons";

export function MealsScreen() {
  const { meals, nutrionalValuePreferences } = useContext(AppContext);
  const [newMealName, setNewMealName] = useState("");
  const [newNutrionalValues, setNewNutrionalValues] = useState<
    Record<OptionKey, string>
  >(EMPTY_NUTRIONAL_VALUES_STRINGS);

  async function add() {
    if (newMealName.length === 0) {
      return;
    }

    await meals.add({
      name: newMealName,
      ...parseValuesToNumbers({
        ...newNutrionalValues,
      }),
    });

    setNewMealName("");
    setNewNutrionalValues(EMPTY_NUTRIONAL_VALUES_STRINGS);
    Keyboard.dismiss();
  }

  function moveUpInOrder(mealKey: string) {
    meals.moveUpInOrder(mealKey);
  }

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ ...sharedStyles.screenView, ...sharedStyles.section }}
      >
        <View style={sharedStyles.titleView}>
          <StyledText
            style={{
              ...sharedStyles.screenTitle,
            }}
          >
            Meals
          </StyledText>
        </View>

        <View style={{ marginTop: 15 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: defaultBorderColor,
              borderRadius: defaultBorderRadius,
              padding: 15,
              elevation: 7,
              backgroundColor: "white",
              shadowColor: "rgba(0, 0, 0, 0.25)",
            }}
          >
            <View>
              <StyledText style={sharedStyles.labelText}>Name</StyledText>
              <StyledTextInput
                value={newMealName}
                onChangeText={(value) => setNewMealName(value)}
                style={sharedStyles.textInput}
                placeholder="Oatmeal"
              />
            </View>

            {nutrionalValuePreferences.enabledValues.map((key) => {
              return (
                <View
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: 15,
                  }}
                >
                  <StyledText style={sharedStyles.labelText}>
                    {OPTIONS[key].label} per 100g
                  </StyledText>
                  <StyledTextInput
                    value={newNutrionalValues[key]}
                    onChangeText={(value) =>
                      setNewNutrionalValues({
                        ...newNutrionalValues,
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

            <Pressable
              onPress={add}
              style={{ marginTop: 15, ...sharedStyles.button }}
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

          <View style={{ paddingBottom: endPadding }}>
            {Object.keys(meals.entries).map((mealKey, i) => {
              const meal = meals.entries[mealKey];

              const content = nutrionalValuePreferences.enabledValues.reduce(
                (content, key, i) => {
                  return (
                    content +
                    (i === 0 ? "" : "\n") +
                    (meal[key] ?? "0") +
                    OPTIONS[key].representation.valueRelated.unit +
                    " " +
                    OPTIONS[key].representation.valueRelated.suffix
                  );
                },
                ""
              );

              return (
                <DefaultEntry
                  key={mealKey}
                  title={mealKey}
                  content={content}
                  prefix={
                    <View
                      style={{
                        display: "flex",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Pressable
                        disabled={i === 0}
                        onPress={() => moveUpInOrder(mealKey)}
                        style={{
                          opacity: i === 0 ? 0.5 : 1,
                          padding: 5,
                          backgroundColor: "black",
                          borderRadius: 100,
                        }}
                        android_ripple={{
                          color: "rgba(255, 255, 255, 0.75)",
                          foreground: true,
                        }}
                      >
                        <StyledText>
                          <Ionicons size={20} name="chevron-up" color="white" />
                        </StyledText>
                      </Pressable>
                    </View>
                  }
                  actions={
                    <Pressable
                      style={{
                        backgroundColor: "#dc2626",
                        padding: 7,
                        borderRadius: defaultBorderRadius,
                      }}
                      onPress={async () => {
                        await meals.remove(mealKey);
                      }}
                    >
                      <StyledText style={{ color: "white", fontSize: 12 }}>
                        Delete
                      </StyledText>
                    </Pressable>
                  }
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
