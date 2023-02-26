import { Text, TextProps } from "react-native";
import { tw } from "../lib/tw";

const sizeStylings = {
  xs: {
    fontSize: 11,
    lineHeight: 18,
  },
  sm: {
    fontSize: 13,
    lineHeight: 19,
  },
  md: {
    fontSize: 14,
    lineHeight: 20,
  },
  lg: {
    fontSize: 18,
    lineHeight: 26,
  },
  xl: {
    fontSize: 22,
  },
  "2xl": {
    fontSize: 24,
  },
  "3": {
    fontSize: 24,
  },
  "4xl": {
    fontSize: 64,
  },
  "5xl": {
    fontSize: 72,
  },
};

export interface StyledTextProps {
  size?: keyof typeof sizeStylings;
}

export function StyledText(props: TextProps & StyledTextProps) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: "Azeret-Mono", includeFontPadding: false },
        tw`text-black`,
        sizeStylings[props.size ?? "md"],
        props.style,
      ]}
    />
  );
}
