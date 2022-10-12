import { PropsWithChildren, ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { defaultBorderRadius, sharedColors } from "../constants/layout";
import { StyledText } from "./StyledText";

export const entryTopMargin = 10;

export function Entry({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      style={{
        borderRadius: defaultBorderRadius,
        padding: 20,
        marginTop: entryTopMargin,
        backgroundColor: "white",
        elevation: 4,
        shadowColor: "rgba(0, 0, 0, 0.1)",
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
          <StyledText style={{ color: sharedColors.gray[6] }}>
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
