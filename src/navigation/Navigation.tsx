/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import {
  ColorSchemeName,
  Keyboard,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { StyledText } from "../components/StyledText";

import { sharedColors } from "../constants/layout";
import { MealsScreen } from "../screens/MealsScreen";
import ModalScreen from "../screens/ModalScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { RootStackParamList, RootTabParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import { HomeScreen } from "../screens/HomeScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { Ionicons } from "@expo/vector-icons";

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

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Root"
        component={BottomTabNavigator}
        options={{
          headerShown: true,

          header: ({ navigation }) => {
            return (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  backgroundColor: "white",
                }}
              >
                <Pressable
                  style={{
                    paddingTop: 5,
                    paddingBottom: 10,
                    paddingRight: 15,
                  }}
                  onPress={() => navigation.navigate("Settings")}
                >
                  <StyledText>
                    <Ionicons size={20} name="settings" />
                  </StyledText>
                </Pressable>
              </View>
            );
          },
        }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidShow", () => setIsKeyboardOpen(true));
    Keyboard.addListener("keyboardDidHide", () => setIsKeyboardOpen(false));

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={({ navigation }) => {
        return (
          <View
            style={{
              padding: 25,
              backgroundColor: "transparent",
              position: "absolute",
              bottom: 0,
              display: isKeyboardOpen ? "none" : "flex",
            }}
          >
            <View
              style={{
                shadowColor: "rgba(0, 0, 0, 0.7)",
                shadowOpacity: 1,
                shadowOffset: {
                  height: 10,
                  width: 10,
                },
                elevation: 7,
                backgroundColor: "black",
                borderRadius: 10,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: "33.33%",
                  overflow: "hidden",
                  borderRadius: 10,
                }}
              >
                <Pressable
                  onPress={() => navigation.navigate("Meals")}
                  android_ripple={{
                    color: sharedColors.gray[7],
                    foreground: true,
                  }}
                >
                  <StyledText
                    style={{
                      color: "white",
                      padding: 15,
                      textAlign: "center",
                    }}
                  >
                    Meals
                  </StyledText>
                </Pressable>
              </View>

              <View
                style={{
                  width: "30%",
                  overflow: "hidden",
                  borderRadius: 5,
                  marginTop: -8,
                  marginBottom: 8,
                }}
              >
                <Pressable
                  onPress={() => navigation.navigate("Home")}
                  android_ripple={{
                    color: sharedColors.gray[6],
                    foreground: true,
                  }}
                >
                  <StyledText
                    style={{
                      color: "white",
                      padding: 10,
                      textAlign: "center",
                      backgroundColor: sharedColors.gray[8],
                      borderRadius: 5,
                      elevation: 10,
                    }}
                  >
                    New entry
                  </StyledText>
                </Pressable>
              </View>

              <View
                style={{
                  width: "33.33%",
                  overflow: "hidden",
                  borderRadius: 10,
                }}
              >
                <Pressable
                  onPress={() => navigation.navigate("History")}
                  android_ripple={{
                    color: sharedColors.gray[7],
                    foreground: true,
                  }}
                >
                  <StyledText
                    style={{
                      color: "white",
                      padding: 15,
                      textAlign: "center",
                    }}
                  >
                    History
                  </StyledText>
                </Pressable>
              </View>
            </View>
          </View>
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
