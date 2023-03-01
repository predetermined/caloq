import { useContext } from "react";
import { ScrollView, View } from "react-native";

import { curveNatural } from "d3-shape";
import { LineChart } from "react-native-svg-charts";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import { AppContext } from "../contexts/appContext";
import { NUTRIONAL_METRICS } from "../hooks/useNutrionalValuePreferences";
import { DAY, getCurrentDateWithOffset, getDateAtHour0 } from "../lib/date";
import { tw } from "../lib/tw";

export function HomeScreen() {
  const { history, nutrionalValuePreferences, hidingNumbers } =
    useContext(AppContext);

  const enabledValuesWithoutKcal =
    nutrionalValuePreferences.enabledValues.filter((value) => value !== "kcal");

  const last7Days = history.getAggregatedDataForPeriod(
    getDateAtHour0(getCurrentDateWithOffset(-DAY * 7))
  );

  const chartData = last7Days.dateGroups
    .filter((d) => d.sum.kcal > 0)
    .map((d) => {
      return d.sum.kcal;
    })
    .reverse();

  return (
    <View style={[tw`bg-white pt-6 flex-1`]}>
      <View>
        <View style={tw`relative h-32`}>
          <LineChart
            style={tw`h-full rounded`}
            svg={{
              stroke: tw.color("green-200"),
              strokeWidth: 1.6,
            }}
            contentInset={{ top: 15, bottom: 15 }}
            data={chartData}
            curve={curveNatural}
          ></LineChart>

          <View
            style={tw`absolute inset-0 h-full w-full flex-row justify-center items-center`}
          >
            <View style={tw`flex-row -mr-8 justify-center items-end`}>
              <StyledText size="5xl">
                {hidingNumbers.isHiding ? "X" : history.today.sum.kcal}
              </StyledText>
              <StyledText
                style={[{ marginBottom: 13, lineHeight: 15 }]}
                size="sm"
              >
                kcal
              </StyledText>
            </View>
          </View>
        </View>

        <View style={[tw`p-4 pt-0 flex-row justify-start flex-wrap`]}>
          {enabledValuesWithoutKcal.map((value, i) => {
            return (
              <View
                key={value}
                style={tw`w-1/${Math.min(
                  2,
                  enabledValuesWithoutKcal.length
                )} flex-row ${i % 2 !== 0 ? "justify-end" : ""} ${
                  i >= 2 ? "mt-4" : ""
                }`}
              >
                <View>
                  <StyledText style={tw`opacity-75 text-gray-700`}>
                    {NUTRIONAL_METRICS[value].label}
                  </StyledText>
                  <StyledText style={tw`text-black`} size="lg">
                    {hidingNumbers.isHiding ? "X" : history.today.sum[value]}
                  </StyledText>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={tw`bg-gray-100 flex-1`}>
        {history.today.entries.length === 0 ? (
          <View style={tw`flex-1 mb-20 justify-center items-center`}>
            <StyledText size="lg">Go, count some calories :)</StyledText>
          </View>
        ) : (
          <ScrollView style={[tw`pt-0`]}>
            <View style={tw`mb-24`}>
              {history.today.entries.map((entry, i) => {
                return (
                  <HistoryEntry
                    style={[
                      tw`border-gray-300`,
                      tw`${i === 0 ? "border-t-0" : ""}`,
                      tw`${
                        i === history.today.entries.length - 1 ? "border-b" : ""
                      }`,
                    ]}
                    key={entry.dateIso}
                    entry={entry}
                  />
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
