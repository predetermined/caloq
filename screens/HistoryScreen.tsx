import { useContext, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import { endPadding, sharedColors, sharedStyles } from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { OPTIONS } from "../hooks/useNutrionalValuePreferences";
import { calculateSum } from "../lib/calculateSum";

export function HistoryScreen() {
  const { history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  const historyGroupedByDate = useMemo(() => {
    return history.entries.reduce((groups, entry) => {
      if (!groups[entry.dateReadable]) {
        groups[entry.dateReadable] = [];
      }
      groups[entry.dateReadable].push(entry);

      return groups;
    }, {} as Record<string, typeof history["entries"]>);
  }, [history.entries]);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ ...sharedStyles.screenView, ...sharedStyles.section }}
      >
        <View style={sharedStyles.titleView}>
          <StyledText
            style={{
              ...sharedStyles.screenTitle,
            }}
          >
            History
          </StyledText>
        </View>

        <View style={{ marginTop: 15 }}>
          {history.entries.length === 0 ? (
            <StyledText>Nothing here yet. Btw., you are amazing!</StyledText>
          ) : null}

          <View style={{ paddingBottom: endPadding }}>
            {Object.keys(historyGroupedByDate)
              .slice(0, 7)
              .map((date, i) => {
                const entries = historyGroupedByDate[date];
                const sum = calculateSum(entries);

                return (
                  <View key={date}>
                    <StyledText
                      style={{
                        fontSize: 20,
                        marginBottom: 5,
                        marginTop: i === 0 ? 0 : 25,
                      }}
                    >
                      {date}
                    </StyledText>

                    <StyledText
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        fontSize: 11,
                        marginBottom: 15,
                        color: sharedColors.gray[5],
                        lineHeight: 13,
                      }}
                    >
                      {nutrionalValuePreferences.enabledValues.map((key, i) => {
                        return (
                          <StyledText key={key}>
                            {i === 0 ? null : " • "}
                            <StyledText style={{ color: "black" }}>
                              {hidingNumbers.isHiding ? "X" : sum[key]}
                              {OPTIONS[key].representation.valueRelated.unit}
                            </StyledText>{" "}
                            {OPTIONS[key].representation.valueRelated.suffix}
                          </StyledText>
                        );
                      })}
                    </StyledText>

                    {entries.map((entry, i) => {
                      return (
                        <HistoryEntry
                          key={entry.dateIso}
                          entry={entry}
                          style={{ marginTop: i === 0 ? 0 : 15 }}
                        />
                      );
                    })}
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
