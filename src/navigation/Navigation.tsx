import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, StatusBar, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { useKeyboard } from "../hooks/useKeyboard";
import { tw } from "../lib/tw";
import { HistoryScreen } from "../screens/HistoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MealsScreen } from "../screens/MealsScreen";
import { NotFoundScreen } from "../screens/NotFoundScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RootStackParamList, RootTabParamList } from "../types";
import { AddMealEntryForm } from "./AddMealEntryForm";
import LinkingConfiguration from "./LinkingConfiguration";

export function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
        }}
      >
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{ title: "Oops!" }}
        />
      </Stack.Navigator>
    </>
  );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const [isAddEntryFormOpen, setIsEntryFormOpen] = React.useState(false);
  const { isKeyboardOpen } = useKeyboard();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={({ navigation, state }) => {
        const activeRouteName = state.routes[state.index].name;
        const isRouteWithHangingWrapper = ["History"].includes(activeRouteName);
        const iconColor = tw.color("white");

        return (
          <>
            <AddMealEntryForm
              isOpen={isAddEntryFormOpen}
              onClose={() => setIsEntryFormOpen(false)}
            />

            <StatusBar
              barStyle="dark-content"
              backgroundColor={
                isRouteWithHangingWrapper && !isAddEntryFormOpen
                  ? tw.color("gray-100")
                  : "white"
              }
            />

            <View
              style={tw`pb-4 px-8 absolute bottom-0 z-50 ${
                isKeyboardOpen ? "hidden" : "flex"
              }`}
            >
              <View
                style={tw`shadow-xl bg-gray-900 rounded-lg flex-row items-center justify-center relative`}
              >
                <View style={tw`w-1/5 rounded-lg items-center overflow-hidden`}>
                  <Button
                    style={tw`bg-gray-900 w-full items-center`}
                    onPress={() => navigation.navigate("Home")}
                  >
                    <Ionicons
                      size={20}
                      color={iconColor}
                      name={
                        activeRouteName === "Home" ? "home" : "home-outline"
                      }
                    />
                  </Button>
                </View>

                <View style={tw`w-1/5 rounded-lg items-center overflow-hidden`}>
                  <Button
                    style={tw`bg-gray-900 w-full items-center`}
                    onPress={() => navigation.navigate("Meals")}
                  >
                    <Ionicons
                      size={20}
                      color={iconColor}
                      name={
                        activeRouteName === "Meals"
                          ? "restaurant"
                          : "restaurant-outline"
                      }
                    />
                  </Button>
                </View>

                <View style={tw`w-1/5 flex-row justify-center -mt-8`}>
                  <Button
                    style={tw`h-16 w-16 p-0 rounded-full shadow justify-center items-center`}
                    onPress={() => setIsEntryFormOpen((v) => !v)}
                  >
                    <Ionicons color="white" size={28} name="add" />
                  </Button>
                </View>

                <View style={tw`w-1/5 rounded-lg items-center overflow-hidden`}>
                  <Button
                    style={tw`bg-gray-900 w-full items-center`}
                    onPress={() => navigation.navigate("History")}
                  >
                    <Ionicons
                      size={20}
                      color={iconColor}
                      name={
                        activeRouteName === "History"
                          ? "stats-chart"
                          : "stats-chart-outline"
                      }
                    />
                  </Button>
                </View>

                <View style={tw`w-1/5 rounded-lg items-center overflow-hidden`}>
                  <Button
                    style={tw`bg-gray-900 w-full items-center`}
                    onPress={() => navigation.navigate("Settings")}
                  >
                    <Ionicons
                      size={20}
                      color={iconColor}
                      name={
                        activeRouteName === "Settings"
                          ? "settings"
                          : "settings-outline"
                      }
                    />
                  </Button>
                </View>
              </View>
            </View>
          </>
        );
      }}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="History" component={HistoryScreen} />
      <BottomTab.Screen name="Meals" component={MealsScreen} />
      <BottomTab.Screen name="Settings" component={SettingsScreen} />
    </BottomTab.Navigator>
  );
}
