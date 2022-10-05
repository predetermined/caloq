import { useContext } from "react";
import { Pressable, ScrollView, View, ToastAndroid } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { StyledText } from "../components/StyledText";
import {
  defaultBorderRadius,
  defaultFontFamily,
  defaultFontSize,
  sharedColors,
  sharedStyles,
} from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { OptionKey, OPTIONS } from "../hooks/useNutrionalValuePreferences";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { HistoryEntry, uniqifyEntry } from "../hooks/useHistory";
import { Meal, MealAsObject } from "../hooks/useMeals";

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
      history.addMany(historyEntriesToInsert, { shouldSort: true });

      ToastAndroid.showWithGravity(
        `Imported ${historyEntriesToInsert.length} new history entries and new ${mealEntriesToAdd.length} meals.`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Failed to import.", ToastAndroid.BOTTOM);
    }
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ ...sharedStyles.screenView, ...sharedStyles.section }}
      >
        <View style={{ marginTop: 15 }}>
          <StyledText
            style={{
              fontSize: 20,
              marginBottom: 15,
            }}
          >
            Nutrional values to display
          </StyledText>

          {Object.entries(OPTIONS).map(([_key, option], i) => {
            const key = _key as OptionKey;

            return (
              <BouncyCheckbox
                key={key}
                innerIconStyle={{
                  borderRadius: defaultBorderRadius,
                  borderColor: sharedColors.gray[1],
                  borderWidth: 0,
                }}
                textStyle={{
                  textDecorationLine: "none",
                  fontSize: defaultFontSize,
                  fontFamily: defaultFontFamily,
                  color: "black",
                }}
                bounceEffectIn={0.9}
                fillColor={sharedColors.red}
                unfillColor={sharedColors.gray[3]}
                iconStyle={{ borderRadius: defaultBorderRadius }}
                text={option.label}
                style={{
                  marginTop: i === 0 ? 0 : 15,
                }}
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

        <View style={{ marginTop: 25 }}>
          <StyledText
            style={{
              fontSize: 20,
              marginBottom: 15,
            }}
          >
            Visibility
          </StyledText>

          <BouncyCheckbox
            innerIconStyle={{
              borderRadius: defaultBorderRadius,
              borderColor: sharedColors.gray[1],
              borderWidth: 0,
            }}
            textStyle={{
              textDecorationLine: "none",
              fontSize: defaultFontSize,
              fontFamily: defaultFontFamily,
              color: "black",
            }}
            bounceEffectIn={0.9}
            fillColor={sharedColors.red}
            unfillColor={sharedColors.gray[3]}
            iconStyle={{ borderRadius: defaultBorderRadius }}
            text="Hide numbers"
            isChecked={hidingNumbers.isHiding}
            onPress={() => {
              hidingNumbers.toggle();
            }}
          />
        </View>

        <View style={{ marginTop: 25 }}>
          <StyledText
            style={{
              fontSize: 20,
              marginBottom: 15,
            }}
          >
            Data
          </StyledText>

          <Pressable
            style={{
              padding: 15,
              backgroundColor: sharedColors.gray[7],
              borderRadius: defaultBorderRadius,
              marginBottom: 5,
            }}
            onPress={importData}
          >
            <StyledText style={{ color: "white" }}>Import</StyledText>
          </Pressable>
          <StyledText
            style={{
              color: sharedColors.gray[5],
              fontSize: 11,
              lineHeight: 13,
            }}
          >
            Import your previously exported file.
          </StyledText>

          <Pressable
            style={{
              padding: 15,
              backgroundColor: "black",
              borderRadius: defaultBorderRadius,
              marginTop: 15,
              marginBottom: 5,
            }}
            onPress={exportData}
          >
            <StyledText style={{ color: "white" }}>Export</StyledText>
          </Pressable>
          <StyledText
            style={{
              color: sharedColors.gray[5],
              fontSize: 11,
              lineHeight: 13,
            }}
          >
            Create a new folder to use for caloq exports. You can then sync the
            generated file across devices the way you like and restore from it
            later on.
          </StyledText>
        </View>
      </ScrollView>
    </>
  );
}
