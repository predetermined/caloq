import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { Button } from "../components/Button";
import { DefaultEntry } from "../components/Entry";
import { HangingWrapper } from "../components/HangingWrapper";
import { Label } from "../components/Label";
import { StyledText } from "../components/StyledText";
import { StyledTextInput } from "../components/StyledTextInput";
import { AppContext } from "../contexts/appContext";
import {
  EMPTY_NUTRIONAL_VALUES_STRINGS,
  NUTRIONAL_METRICS,
  OptionKey,
} from "../hooks/useNutrionalValuePreferences";
import { parseValuesToNumbers } from "../lib/parseValuesToNumbers";
import { tw } from "../lib/tw";

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
        overScrollMode="never"
        style={tw`bg-white`}
      >
        <HangingWrapper>
          <View>
            <Label>Name</Label>
            <StyledTextInput
              value={newMealName}
              onChangeText={(value) => setNewMealName(value)}
              placeholder="Oatmeal"
            />
          </View>

          {nutrionalValuePreferences.enabledValues.map((key) => {
            return (
              <View key={key} style={tw`mt-4`}>
                <Label>{NUTRIONAL_METRICS[key].label} per 100g</Label>
                <StyledTextInput
                  value={newNutrionalValues[key]}
                  onChangeText={(value) =>
                    setNewNutrionalValues({
                      ...newNutrionalValues,
                      [key]: value,
                    })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            );
          })}

          <Button onPress={add} style={tw`mt-4 bg-gray-800`}>
            Add
          </Button>
        </HangingWrapper>

        <View style={tw`p-4 pt-0 mb-20`}>
          {Object.keys(meals.entries).map((mealKey, i) => {
            const meal = meals.entries[mealKey];

            const content = nutrionalValuePreferences.enabledValues.reduce(
              (content, key, i) => {
                return (
                  content +
                  (i === 0 ? "" : "\n") +
                  (meal[key] ?? "0") +
                  NUTRIONAL_METRICS[key].representation.valueRelated.unit +
                  " " +
                  NUTRIONAL_METRICS[key].representation.valueRelated.suffix
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
                  <View style={tw`flex-1 justify-center`}>
                    <Button
                      disabled={i === 0}
                      onPress={() => moveUpInOrder(mealKey)}
                      style={tw`${
                        i === 0 ? "opacity-50" : ""
                      } p-2 rounded-b-full rounded-t-full bg-gray-800 mr-4 h-14 w-14 items-center justify-center`}
                    >
                      <Ionicons size={20} name="chevron-up" color="white" />
                    </Button>
                  </View>
                }
                actions={
                  <Pressable
                    style={tw`p-2 rounded bg-gray-800`}
                    onPress={async () => {
                      await meals.remove(mealKey);
                    }}
                  >
                    <StyledText style={tw`text-white`} size="sm">
                      Delete
                    </StyledText>
                  </Pressable>
                }
              />
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
