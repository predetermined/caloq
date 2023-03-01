import { curveNatural } from "d3-shape";
import { useContext, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { Grid, LineChart, XAxis, YAxis } from "react-native-svg-charts";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import { DEFAULT_FONT_FAMILY } from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { NUTRIONAL_METRICS } from "../hooks/useNutrionalValuePreferences";
import { calculateSum } from "../lib/calculateSum";
import { DAY, getCurrentDateWithOffset, getDateAtHour0 } from "../lib/date";
import { tw } from "../lib/tw";

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

  const last7Days = history.getAggregatedDataForPeriod(
    getDateAtHour0(getCurrentDateWithOffset(-DAY * 7))
  );

  const last30Days = history.getAggregatedDataForPeriod(
    getDateAtHour0(getCurrentDateWithOffset(-DAY * 30))
  );

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
        style={tw`bg-white`}
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
        <View style={tw`mt-4 p-4 pt-0 mb-20`}>
          <View style={tw`mb-6`}>
            <View style={tw`flex-row justify-center  items-center`}>
              <View style={tw`mr-4`}>
                <StyledText
                  size="xs"
                  style={[
                    tw`text-center mb-1 text-gray-600`,
                    { fontFamily: "Azeret-Mono-Italic" },
                  ]}
                >
                  Last 7 days avg.
                </StyledText>
                <StyledText style={tw`text-center`} size="md">
                  {hidingNumbers.isHiding
                    ? "X"
                    : Math.round(last7Days.avg.kcal)}{" "}
                  kcal
                </StyledText>
              </View>

              <View>
                <StyledText
                  size="xs"
                  style={[
                    tw`text-center mb-1 text-gray-600`,
                    { fontFamily: "Azeret-Mono-Italic" },
                  ]}
                >
                  Last 30 days avg.
                </StyledText>
                <StyledText style={tw`text-center`} size="md">
                  {hidingNumbers.isHiding
                    ? "X"
                    : Math.round(last30Days.avg.kcal)}{" "}
                  kcal
                </StyledText>
              </View>
            </View>

            {chartData.sums.length >= 7 ? (
              <View
                style={{
                  padding: 20,
                  // height + padding * 2 + XAxis font size * XAxis line height + Xaxis top padding
                  height: 150 + 20 * 2 + 11 * 1.4 + 10,
                  marginBottom: -20,
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
                      fill: tw.color("gray-600"),
                      fontSize: 11,
                      fontFamily: DEFAULT_FONT_FAMILY,
                    }}
                    contentInset={{ top: 5, bottom: 5 }}
                    numberOfTicks={4}
                  />

                  <LineChart
                    style={tw`w-full h-full pr-4 pl-2`}
                    contentInset={{ top: 5, left: 10, bottom: 5 }}
                    data={chartData.sums}
                    svg={{ stroke: tw.color("gray-700"), strokeWidth: 1 }}
                    curve={curveNatural}
                  >
                    <Grid
                      svg={{
                        stroke: tw.color("gray-300"),
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
                    fill: tw.color("gray-600"),
                    fontFamily: DEFAULT_FONT_FAMILY,
                  }}
                  style={tw`pt-2`}
                />
              </View>
            ) : null}
          </View>

          {history.entries.length === 0 ? (
            <StyledText style={tw`text-center`}>
              Nothing here yet. Start counting! :)
            </StyledText>
          ) : null}

          <View>
            {Object.keys(historyGroupedByDate)
              .slice(0, amountOfLoadedDays)
              .map((date, i) => {
                const entries = historyGroupedByDate[date];
                const sum = calculateSum(entries);

                return (
                  <View key={date}>
                    <StyledText
                      size="xl"
                      style={[tw`${i !== 0 ? "mt-6" : ""}`]}
                    >
                      {date}
                    </StyledText>

                    <StyledText style={tw`flex-row mb-2`}>
                      {nutrionalValuePreferences.enabledValues.map((key, i) => {
                        return (
                          <StyledText
                            size="xs"
                            style={tw`text-gray-600`}
                            key={key}
                          >
                            {i === 0 ? null : " • "}
                            <StyledText size="xs" style={tw`text-gray-600`}>
                              {hidingNumbers.isHiding ? "X" : sum[key]}
                              {
                                NUTRIONAL_METRICS[key].representation
                                  .valueRelated.unit
                              }
                            </StyledText>{" "}
                            {
                              NUTRIONAL_METRICS[key].representation.valueRelated
                                .suffix
                            }
                          </StyledText>
                        );
                      })}
                    </StyledText>

                    <View style={tw`-mx-4`}>
                      {entries.map((entry, i) => {
                        return (
                          <HistoryEntry
                            key={entry.dateIso}
                            entry={entry}
                            style={tw`${
                              i === entries.length - 1 ? "border-b" : ""
                            }`}
                          />
                        );
                      })}
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
