import { PropsWithChildren, ReactNode } from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import {
  defaultBorderColor,
  defaultBorderRadius,
  sharedColors,
} from "../constants/layout";
import { StyledText } from "./StyledText";

export function Entry({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: defaultBorderColor,
        borderRadius: defaultBorderRadius,
        padding: 15,
        marginTop: 15,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function DefaultEntry({
  title,
  content,
  actions,
  style,
  prefix,
}: {
  title: string;
  content: string;
  actions?: ReactNode;
  prefix?: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Entry
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        ...style,
      }}
    >
      <View style={{ display: "flex", flexDirection: "row" }}>
        {prefix ? <View style={{ marginRight: 15 }}>{prefix}</View> : null}
        <View>
          <StyledText style={{ color: sharedColors.gray[4], fontSize: 12 }}>
            {title}
          </StyledText>

          <View>
            <StyledText>{content}</StyledText>
          </View>
        </View>
      </View>

      <View>{actions}</View>
    </Entry>
  );
}
