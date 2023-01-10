import { PropsWithChildren } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { tw } from "../lib/tw";
import { StyledText } from "./StyledText";

export function Button(
  props: PropsWithChildren<PressableProps> & {
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  }
) {
  return (
    <Pressable
      {...props}
      style={[tw`bg-gray-800 py-4 px-3 rounded overflow-hidden`, props.style]}
      android_ripple={{
        color: tw.color("white opacity-5"),
        foreground: true,
      }}
    >
      {typeof props.children !== "string" ? (
        props.children
      ) : (
        <StyledText style={[props.textStyle, tw`text-center text-white`]}>
          {props.children}
        </StyledText>
      )}
    </Pressable>
  );
}
