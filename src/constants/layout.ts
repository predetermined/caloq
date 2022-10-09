import { StyleSheet } from "react-native";

export const sharedColors = {
  // 50, 100, 200, ..., 900
  gray: [
    "#fafafa",
    "#f5f5f5",
    "#e5e5e5",
    "#d4d4d4",
    "#a3a3a3",
    "#737373",
    "#525252",
    "#404040",
    "#262626",
    "#171717",
  ],
  red: "#dc2626",
};

export const defaultBorderColor = "#ededed";
export const defaultBorderRadius = 3;
export const defaultFontSize = 14;
export const defaultFontFamily = "Azeret-Mono";
export const endPadding = 100;
export const firstElementTopMargin = 40;
export const screenBackgroundColor = sharedColors.gray[1];

export const sharedStyles = StyleSheet.create({
  screenView: {
    backgroundColor: screenBackgroundColor,
    height: "100%",
  },
  section: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  screenTitle: {
    marginTop: 0,
    fontSize: 25,
    lineHeight: 24,
    fontFamily: "Azeret-Mono-SemiBold",
  },
  titleView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelText: {
    display: "flex",
    fontSize: 13,
    marginBottom: 5,
  },
  textInput: {
    display: "flex",
    borderRadius: defaultBorderRadius,
    padding: 9,
    fontSize: defaultFontSize,
    fontFamily: defaultFontFamily,
    backgroundColor: sharedColors.gray[1],
  },
  button: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    border: "1px solid black",
    borderRadius: defaultBorderRadius,
    paddingLeft: 9,
    paddingRight: 9,
    paddingTop: 20,
    paddingBottom: 20,
    textAlign: "center",
    backgroundColor: "black",
    color: "white",
  },
});
