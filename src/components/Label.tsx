import { PropsWithChildren } from "react";
import { StyleProp, TextStyle } from "react-native";
import { tw } from "../lib/tw";
import { StyledText, StyledTextProps } from "./StyledText";

export function Label(
  props: PropsWithChildren<unknown> & {
    style?: StyleProp<TextStyle>;
  } & StyledTextProps
) {
  const { style, size, ...forwardProps } = props;

  return (
    <StyledText {...forwardProps} style={[tw`mb-1`, style]} size={size ?? "sm"}>
      {props.children}
    </StyledText>
  );
}
