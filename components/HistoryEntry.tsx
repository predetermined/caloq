import { useContext } from "react";
import { Pressable, ViewStyle } from "react-native";
import { defaultBorderRadius } from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { HistoryEntry as IHistoryEntry } from "../hooks/useHistory";
import { OPTIONS } from "../hooks/useNutrionalValuePreferences";
import { DefaultEntry } from "./Entry";
import { StyledText } from "./StyledText";

export function HistoryEntry({
  entry,
  style,
}: {
  entry: IHistoryEntry;
  style?: ViewStyle;
}) {
  const { history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  const content = nutrionalValuePreferences.enabledValues.reduce(
    (content, key, i) => {
      return (
        content +
        (i === 0 ? "" : "\n") +
        (hidingNumbers.isHiding ? "X" : entry[key] ?? "0") +
        OPTIONS[key].representation.valueRelated.unit +
        " " +
        OPTIONS[key].representation.valueRelated.suffix
      );
    },
    ""
  );

  return (
    <DefaultEntry
      title={new Date(entry.dateIso).toLocaleString()}
      content={content}
      actions={
        <Pressable
          style={{
            backgroundColor: "#dc2626",
            padding: 7,
            borderRadius: defaultBorderRadius,
          }}
          onPress={async () => {
            await history.remove(entry.dateIso);
          }}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.25)",
            foreground: true,
          }}
        >
          <StyledText style={{ color: "white", fontSize: 12 }}>
            Delete
          </StyledText>
        </Pressable>
      }
      style={style}
    />
  );
}
