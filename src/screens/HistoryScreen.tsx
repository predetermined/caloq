import { useContext, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
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
  defaultFontFamily,
} from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { OPTIONS } from "../hooks/useNutrionalValuePreferences";
import { calculateSum } from "../lib/calculateSum";
import { LineChart, Grid, YAxis, XAxis } from "react-native-svg-charts";

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

  const chartData = useMemo(() => {
    const entries = Object.entries(historyGroupedByDate).slice(0, 30);

    return {
      dates: entries.map(([date]) => date).reverse(),
      sums: entries
        .map(([, entries]) => {
          return entries.reduce((sum, entry) => {
            return sum + entry.kcal;
          }, 0);
        })
        .reverse(),
    };
  }, [historyGroupedByDate]);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        style={{
          ...sharedStyles.screenView,
        }}
        onLayout={(e) => {
          const favorableOffset = 100;

          if (
            e.nativeEvent.layout.height - favorableOffset >
            Dimensions.get("screen").height
          ) {
            return;
          }

          console.debug("HistoryScreen: loaded more entries on layout");
          setAmountOfLoadedDays(amountOfLoadedDays + 3);
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

          console.debug("HistoryScreen: loaded more entries on scroll");
          setAlreadyLoadedMoreDaysForContentSizeRef.current.add(
            e.nativeEvent.contentSize.height
          );
          setAmountOfLoadedDays(amountOfLoadedDays + 3);
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: defaultBorderRadius,
            elevation: 16,
            shadowColor: "rgba(0, 0, 0, 0.3)",
            marginBottom: 20,
            overflow: "hidden",
            paddingTop: firstElementTopMargin,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              padding: 20,
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
                  color: sharedColors.gray[6],
                }}
              >
                Last 30 days avg.
              </StyledText>
              <StyledText
                style={{
                  textAlign: "center",
                  fontSize: 18,
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
                  color: sharedColors.gray[6],
                }}
              >
                Last 7 days avg.
              </StyledText>
              <StyledText
                style={{
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                {Math.round(history.comparisonPeriods.last7Days.avg.kcal)} kcal
              </StyledText>
            </View>
          </View>

          {chartData.sums.length >= 7 ? (
            <View
              style={{
                padding: 20,
                // height + padding * 2 + XAxis font size * XAxis line height + Xaxis top padding
                height: 150 + 20 * 2 + 11 * 1.4 + 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  height: 150,
                }}
              >
                <YAxis
                  data={chartData.sums}
                  svg={{
                    fill: sharedColors.gray[5],
                    fontSize: 11,
                    fontFamily: defaultFontFamily,
                  }}
                  contentInset={{ top: 5, bottom: 5 }}
                  numberOfTicks={4}
                />

                <LineChart
                  style={{
                    height: "100%",
                    width: "100%",
                    paddingRight: 20,
                    paddingLeft: 5,
                  }}
                  contentInset={{ top: 5, left: 10, bottom: 5 }}
                  data={chartData.sums}
                  svg={{ stroke: sharedColors.gray[6] }}
                >
                  <Grid
                    svg={{
                      stroke: sharedColors.gray[3],
                    }}
                  />
                </LineChart>
              </View>

              <XAxis
                data={chartData.sums}
                formatLabel={(value, i) => {
                  if (chartData.sums.length >= 12) {
                    if (i % 5 !== 0) return "";
                  } else if (chartData.sums.length >= 7) {
                    if (i % 2 !== 0) return "";
                  }

                  return chartData.dates[value].slice(0, -3);
                }}
                contentInset={{ left: 45, right: 15 }}
                svg={{
                  fontSize: 11,
                  fill: sharedColors.gray[5],
                  fontFamily: defaultFontFamily,
                }}
                style={{
                  paddingTop: 10,
                }}
              />
            </View>
          ) : null}
        </View>

        <View style={sharedStyles.section}>
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
                        marginTop: i === 0 ? 0 : 20,
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
