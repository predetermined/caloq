import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ScrollView, View } from "react-native";

import { curveNatural } from "d3-shape";
import { LineChart } from "react-native-svg-charts";
import { Button } from "../components/Button";
import { HistoryEntry } from "../components/HistoryEntry";
import { StyledText } from "../components/StyledText";
import { AppContext } from "../contexts/appContext";
import { NUTRIONAL_METRICS } from "../hooks/useNutrionalValuePreferences";
import { DAY, getCurrentDateWithOffset, getDateAtHour0 } from "../lib/date";
import { tw } from "../lib/tw";

export function HomeScreen() {
  const {
    history,
    nutrionalValuePreferences,
    hidingNumbers,
    behavioralSettings,
  } = useContext(AppContext);
  const navigation = useNavigation();

  const enabledValuesWithoutKcal =
    nutrionalValuePreferences.enabledValues.filter((value) => value !== "kcal");

  const last7Days = history.getAggregatedDataForPeriod(
    getDateAtHour0(getCurrentDateWithOffset(-DAY * 7))
  );

  const yesterdayKcalSum = history.getAggregatedDataForPeriod(
    getDateAtHour0(getCurrentDateWithOffset(-DAY)),
    getDateAtHour0(new Date())
  ).sum.kcal;

  const chartData = last7Days.dateGroups
    .filter((d) => d.sum.kcal > 0)
    .map((d) => {
      return d.sum.kcal;
    })
    .reverse();

  const todaysGoalToBalaceOutYesterday = behavioralSettings.dailyKcalGoal
    ? behavioralSettings.dailyKcalGoal -
      (yesterdayKcalSum - behavioralSettings.dailyKcalGoal)
    : 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      style={tw`bg-white pt-6`}
    >
      {chartData.length >= 2 ? (
        <LineChart
          style={tw`h-48 rounded`}
          svg={{
            stroke: tw.color("green-300"),
            strokeWidth: 1.6,
          }}
          contentInset={{ top: 5, bottom: 15 }}
          data={chartData}
          curve={curveNatural}
        />
      ) : null}

      <View style={tw`flex-row justify-center items-end -mr-8`}>
        <StyledText size="5xl">
          {hidingNumbers.isHiding ? "X" : history.today.sum.kcal}
        </StyledText>
        <StyledText style={[{ marginBottom: 13, lineHeight: 15 }]} size="sm">
          kcal
        </StyledText>
      </View>

      <View
        style={[tw`mt-4 p-6 shadow flex-row justify-start flex-wrap bg-black`]}
      >
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
                <StyledText style={tw`opacity-75 text-white`}>
                  {NUTRIONAL_METRICS[value].label}
                </StyledText>
                <StyledText style={tw`text-white`} size="lg">
                  {hidingNumbers.isHiding ? "X" : history.today.sum[value]}
                </StyledText>
              </View>
            </View>
          );
        })}
      </View>

      <View style={tw`p-4 pt-0 pb-8 mb-20`}>
        {behavioralSettings.todaysKcalGoal ? (
          <View style={tw`mt-4`}>
            <View
              style={tw`h-16 bg-gray-100 relative overflow-hidden rounded flex-row`}
            >
              <View
                style={[
                  tw`bg-gray-400 h-full`,
                  {
                    width: hidingNumbers.isHiding
                      ? "100%"
                      : `${Math.round(
                          (history.today.sum.kcal /
                            behavioralSettings.todaysKcalGoal!) *
                            100
                        )}%`,
                  },
                ]}
              />
              <View
                style={tw`absolute inset-0 justify-center items-center z-10`}
              >
                <StyledText size="xs">
                  {hidingNumbers.isHiding
                    ? "X"
                    : behavioralSettings.todaysKcalGoal -
                      history.today.sum.kcal}{" "}
                  kcal remaining out of {behavioralSettings.todaysKcalGoal} kcal
                </StyledText>
              </View>
            </View>
          </View>
        ) : null}

        {behavioralSettings.dailyKcalGoal &&
        yesterdayKcalSum > behavioralSettings.dailyKcalGoal &&
        todaysGoalToBalaceOutYesterday > 0 &&
        behavioralSettings.todaysKcalGoal ===
          behavioralSettings.dailyKcalGoal ? (
          <View style={tw`mt-4`}>
            <View style={tw`p-4 bg-gray-900 relative overflow-hidden rounded`}>
              <StyledText style={tw`text-white`}>
                If you would reduce your kcal intake to{" "}
                <StyledText style={tw`text-white underline`}>
                  {todaysGoalToBalaceOutYesterday} kcal
                </StyledText>{" "}
                today, you could still reach your daily goal over a 2 day
                period.
              </StyledText>

              <Button
                onPress={() =>
                  behavioralSettings.setCustomKcalGoalForToday(
                    todaysGoalToBalaceOutYesterday
                  )
                }
                style={tw`bg-gray-700 mt-3`}
              >
                Reduce today's kcal goal
              </Button>
            </View>
          </View>
        ) : null}

        {chartData.length < 2 ? (
          <View style={tw`mt-4`}>
            <View style={tw`p-4 bg-gray-300 relative overflow-hidden rounded`}>
              <StyledText>One quick tip:</StyledText>
              <StyledText>
                caloq can help you stay on track to reach a certain daily kcal
                goal.
              </StyledText>
              <Button
                onPress={() => navigation.navigate("Settings")}
                style={tw`mt-3`}
              >
                Set daily kcal goal
              </Button>
            </View>
          </View>
        ) : null}

        <View>
          {history.today.entries.map((entry) => {
            return <HistoryEntry key={entry.dateIso} entry={entry} />;
          })}
        </View>
      </View>
    </ScrollView>
  );
}
