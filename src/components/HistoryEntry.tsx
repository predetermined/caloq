import { useContext } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { AppContext } from "../contexts/appContext";
import { HistoryEntry as IHistoryEntry } from "../hooks/useHistory";
import { NUTRIONAL_METRICS } from "../hooks/useNutrionalValuePreferences";
import { tw } from "../lib/tw";
import { DefaultEntry } from "./Entry";
import { StyledText } from "./StyledText";

export function HistoryEntry({
  entry,
  style,
}: {
  entry: IHistoryEntry;
  style?: StyleProp<ViewStyle>;
}) {
  const { history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  const content = nutrionalValuePreferences.enabledValues.reduce(
    (content, key, i) => {
      return (
        content +
        (i === 0 ? "" : "\n") +
        (hidingNumbers.isHiding ? "X" : entry[key] ?? "0") +
        NUTRIONAL_METRICS[key].representation.valueRelated.unit +
        " " +
        NUTRIONAL_METRICS[key].representation.valueRelated.suffix
      );
    },
    ""
  );

  return (
    <DefaultEntry
      title={new Date(entry.dateIso).toLocaleTimeString()}
      content={content}
      actions={
        <Pressable
          style={tw`bg-gray-800 p-2 rounded`}
          onPress={async () => {
            await history.remove(entry.dateIso);
          }}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.25)",
            foreground: true,
          }}
        >
          <StyledText size="xs" style={tw`text-white`}>
            Delete
          </StyledText>
        </Pressable>
      }
      style={style}
    />
  );
}
