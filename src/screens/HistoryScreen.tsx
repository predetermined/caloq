import { useContext, useMemo, useRef, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { entryTopMargin } from "../components/Entry";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import {
  endPadding,
  sharedColors,
  sharedStyles,
  defaultBorderRadius,
  defaultBorderColor,
  firstElementTopMargin,
  screenBackgroundColor,
} from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { OPTIONS } from "../hooks/useNutrionalValuePreferences";
import { calculateSum } from "../lib/calculateSum";

export function HistoryScreen() {
  const { history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);
  const [amountOfLoadedDays, setAmountOfLoadedDays] = useState(3);
  const setAlreadyLoadedMoreDaysForContentSizeRef = useRef(new Set<number>());

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
        overScrollMode="never"
        style={{
          ...sharedStyles.screenView,
          ...sharedStyles.section,
        }}
        onScroll={(e) => {
          if (
            e.nativeEvent.contentOffset.y +
              e.nativeEvent.layoutMeasurement.height <
            e.nativeEvent.contentSize.height -
              e.nativeEvent.layoutMeasurement.height -
              1000
          ) {
            return;
          }

          if (
            setAlreadyLoadedMoreDaysForContentSizeRef.current.has(
              e.nativeEvent.contentSize.height
            )
          ) {
            return;
          }

          console.debug("HistoryScreen: loaded more entries");
          setAlreadyLoadedMoreDaysForContentSizeRef.current.add(
            e.nativeEvent.contentSize.height
          );
          setAmountOfLoadedDays(amountOfLoadedDays + 3);
        }}
      >
        <View
          style={{
            ...sharedStyles.section,
            marginBottom: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: sharedColors.gray[9],
            padding: 20,
            borderRadius: defaultBorderRadius,
            elevation: 16,
            shadowColor: "rgba(0, 0, 0, 0.3)",
            marginTop: firstElementTopMargin,
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
              Last 30 days avg.
            </StyledText>
            <StyledText
              style={{
                textAlign: "center",
                fontSize: 18,
                color: "white",
              }}
            >
              {Math.round(history.comparisonPeriods.last30Days.avg.kcal)} kcal
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
              Last 7 days avg.
            </StyledText>
            <StyledText
              style={{
                textAlign: "center",
                fontSize: 18,
                color: "white",
              }}
            >
              {Math.round(history.comparisonPeriods.last7Days.avg.kcal)} kcal
            </StyledText>
          </View>
        </View>

        <View>
          {history.entries.length === 0 ? (
            <StyledText>Nothing here yet. Keep going!</StyledText>
          ) : null}

          <View style={{ paddingBottom: endPadding }}>
            {Object.keys(historyGroupedByDate)
              .slice(0, amountOfLoadedDays)
              .map((date, i) => {
                const entries = historyGroupedByDate[date];
                const sum = calculateSum(entries);

                return (
                  <View key={date}>
                    <StyledText
                      style={{
                        fontSize: 20,
                        marginBottom: 5,
                        marginTop: i === 0 ? 0 : 15,
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
                          style={{ marginTop: i === 0 ? 0 : entryTopMargin }}
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
