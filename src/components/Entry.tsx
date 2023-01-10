import { PropsWithChildren, ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { tw } from "../lib/tw";
import { StyledText } from "./StyledText";

export function Entry({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[tw`rounded p-4 mt-4 bg-gray-200`, style]}>{children}</View>
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
    <Entry style={[tw`flex-row items-end`, style]}>
      <View style={tw`flex-row flex-1`}>
        {prefix ? <View>{prefix}</View> : null}
        <View>
          <StyledText style={tw`text-gray-600`}>{title}</StyledText>

          <View>
            <StyledText>{content}</StyledText>
          </View>
        </View>
      </View>

      <View>{actions}</View>
    </Entry>
  );
}
