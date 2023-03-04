import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useContext } from "react";
import {
  ScrollView,
  StyleProp,
  ToastAndroid,
  View,
  ViewStyle,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Button } from "../components/Button";
import { StyledText } from "../components/StyledText";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { HistoryEntry, uniqifyEntry } from "../hooks/useHistory";
import { Meal, MealAsObject } from "../hooks/useMeals";
import {
  NUTRIONAL_METRICS,
  OptionKey,
} from "../hooks/useNutrionalValuePreferences";
import { tw } from "../lib/tw";

function Checkbox(props: {
  text: string;
  isChecked: boolean;
  onPress(): void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <BouncyCheckbox
      innerIconStyle={[tw`rounded border-0`]}
      textStyle={[
        tw`text-black no-underline text-base`,
        {
          fontSize: DEFAULT_FONT_SIZE,
          fontFamily: DEFAULT_FONT_FAMILY,
        },
      ]}
      style={props.style}
      bounceEffectIn={0.9}
      fillColor={tw.color(`gray-800`)}
      unfillColor={tw.color(`bg-gray-200`)}
      iconStyle={tw`rounded`}
      text={props.text}
      isChecked={props.isChecked}
      onPress={props.onPress}
    />
  );
}

export function SettingsScreen() {
  const { history, meals, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  async function exportData() {
    const status =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!status.granted) return;

    const parentUri = status.directoryUri;
    const fileName = "data.json";

    try {
      const fileUris =
        await FileSystem.StorageAccessFramework.readDirectoryAsync(parentUri);

      let dataFileUri = fileUris.find((uri) => uri.endsWith("data.json"));

      if (dataFileUri) {
        await FileSystem.deleteAsync(dataFileUri);
      }

      dataFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        parentUri,
        fileName,
        "application/json"
      );

      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        dataFileUri,
        JSON.stringify({
          historyEntries: history.entries,
          mealEntries: meals.entries,
        }),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      ToastAndroid.show("Export saved!", ToastAndroid.BOTTOM);
    } catch (e) {
      ToastAndroid.show("Failed to save.", ToastAndroid.BOTTOM);
    }
  }

  async function importData() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "application/json",
    });

    if (result.type === "cancel") return;

    try {
      const text = await FileSystem.StorageAccessFramework.readAsStringAsync(
        result.uri,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      const data = JSON.parse(text) as {
        historyEntries: HistoryEntry[];
        mealEntries: Record<string, Meal>;
      };

      // check if these entries already exist, otherwise import

      const mealEntriesToAdd: MealAsObject[] = [];
      for (const importMealEntryKey of Object.keys(data.mealEntries)) {
        if (meals.entries[importMealEntryKey]) {
          continue;
        }

        mealEntriesToAdd.push({
          name: importMealEntryKey,
          ...data.mealEntries[importMealEntryKey],
        });
      }
      meals.addMany(mealEntriesToAdd);

      const historyEntriesToInsert: HistoryEntry[] = [];
      for (const importHistoryEntry of data.historyEntries) {
        if (
          history.entries.some(
            (entry) => uniqifyEntry(entry) === uniqifyEntry(importHistoryEntry)
          )
        ) {
          continue;
        }

        historyEntriesToInsert.push(importHistoryEntry);
      }
      history.addMany(historyEntriesToInsert);

      ToastAndroid.showWithGravity(
        `Imported ${historyEntriesToInsert.length} new history entries and new ${mealEntriesToAdd.length} meals.`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    } catch (e) {
      console.debug("SettingsScreen: Failed to import data: ", e);
      ToastAndroid.show("Failed to import.", ToastAndroid.BOTTOM);
    }
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        style={tw`bg-white p-4`}
      >
        <View>
          <StyledText size="lg" style={tw`mb-2`}>
            Nutrional values{"\n"}to display
          </StyledText>

          {Object.entries(NUTRIONAL_METRICS).map(([_key, option], i) => {
            const key = _key as OptionKey;

            return (
              <Checkbox
                key={key}
                text={option.label}
                style={tw`${i !== 0 ? "mt-2" : ""}`}
                isChecked={nutrionalValuePreferences.enabledValues.includes(
                  key
                )}
                onPress={() => {
                  if (nutrionalValuePreferences.enabledValues.includes(key)) {
                    nutrionalValuePreferences.disable(key);
                  } else {
                    nutrionalValuePreferences.enable(key);
                  }
                }}
              />
            );
          })}
        </View>

        <View style={tw`mt-6`}>
          <StyledText size="lg" style={tw`mb-2`}>
            Visibility
          </StyledText>

          <Checkbox
            text="Hide numbers"
            isChecked={hidingNumbers.isHiding}
            onPress={() => {
              hidingNumbers.toggle();
            }}
          />
        </View>

        <View style={tw`mt-6 mb-20`}>
          <StyledText size="lg" style={tw`mb-2`}>
            Data
          </StyledText>

          <Button style={tw`bg-green-400 mb-1`} onPress={importData}>
            <StyledText style={tw`text-green-900 text-center`}>
              Import
            </StyledText>
          </Button>
          <StyledText size="sm" style={tw`text-gray-600`}>
            Import your previously exported file.
          </StyledText>

          <Button style={tw`mt-4 bg-gray-800 mb-1`} onPress={exportData}>
            Export
          </Button>
          <StyledText size="sm" style={tw`text-gray-600`}>
            Create a new folder to use for caloq exports. You can then sync the
            generated file across devices the way you like and restore from it
            later on.
          </StyledText>
        </View>
      </ScrollView>
    </>
  );
}
