import { TextInput, TextInputProps } from "react-native";

export function StyledTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      selectionColor="black"
      style={[
        props.style,
        { fontFamily: "Azeret-Mono", includeFontPadding: false },
      ]}
    />
  );
}
