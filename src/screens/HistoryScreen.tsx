import { useContext, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import {
  endPadding,
  sharedColors,
  sharedStyles,
  defaultBorderRadius,
  defaultBorderColor,
} from "../constants/layout";
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
    <View style={sharedStyles.screenView}>
      <View
        style={{
          ...sharedStyles.section,
          marginBottom: 20,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: sharedColors.gray[9],
          padding: 30,
          borderRadius: defaultBorderRadius,
          elevation: 7,
          shadowColor: "rgba(0, 0, 0, 0.25)",
        }}
      >
        <View
          style={{
            width: "50%",
            borderRadius: defaultBorderRadius,
            marginRight: 5,
          }}
        >
          <StyledText
            style={{
              fontSize: 11,
              textAlign: "center",
              marginBottom: 5,
              fontFamily: "Azeret-Mono-Italic",
              color: "white",
            }}
          >
            Last week avg.
          </StyledText>
          <StyledText
            style={{
              textAlign: "center",
              fontSize: 18,
              color: "white",
            }}
          >
            {history.weeks.last.avg.kcal} kcal
          </StyledText>
        </View>

        <View
          style={{
            width: "50%",
            borderColor: defaultBorderColor,
            borderRadius: defaultBorderRadius,
            marginLeft: 5,
          }}
        >
          <StyledText
            style={{
              fontSize: 11,
              textAlign: "center",
              marginBottom: 5,
              fontFamily: "Azeret-Mono-Italic",
              color: "white",
            }}
          >
            This week avg.
          </StyledText>
          <StyledText
            style={{
              textAlign: "center",
              fontSize: 18,
              color: "white",
            }}
          >
            {history.weeks.current.avg.kcal} kcal
          </StyledText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ ...sharedStyles.section }}
      >
        <View>
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
    </View>
  );
}
