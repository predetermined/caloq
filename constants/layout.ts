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

export const defaultBorderColor = sharedColors.gray[3];
export const defaultBorderRadius = 3;
export const defaultFontSize = 14;
export const defaultFontFamily = "Azeret-Mono";
export const endPadding = 100;

export const sharedStyles = StyleSheet.create({
  screenView: {
    backgroundColor: "#fff",
    height: "100%",
  },
  section: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  screenTitle: {
    marginTop: 0,
    fontSize: 23,
    fontWeight: "300",
  },
  titleView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 5,
  },
  labelText: {
    display: "flex",
    fontSize: 12,
    marginBottom: 5,
  },
  textInput: {
    display: "flex",
    borderWidth: 1,
    borderColor: defaultBorderColor,
    borderRadius: defaultBorderRadius,
    padding: 7,
    fontSize: defaultFontSize,
    fontFamily: defaultFontFamily,
  },
  button: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    border: "1px solid black",
    borderRadius: defaultBorderRadius,
    paddingLeft: 7,
    paddingRight: 7,
    paddingTop: 20,
    paddingBottom: 20,
    textAlign: "center",
    backgroundColor: "black",
    color: "white",
    fontFamily: defaultFontFamily,
  },
});
