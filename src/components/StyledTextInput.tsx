import { TextInput, TextInputProps } from "react-native";
import { tw } from "../lib/tw";

export function StyledTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      selectionColor="black"
      placeholderTextColor={tw.color("gray-600")}
      style={[
        tw`bg-gray-200 py-3 px-4 rounded text-black`,
        props.style,
        { fontFamily: "Azeret-Mono", includeFontPadding: false },
      ]}
    />
  );
}
