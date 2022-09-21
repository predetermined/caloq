import { Pressable, View } from "react-native";
import { StyledText } from "../components/StyledText";

import { RootStackScreenProps } from "../types";

export default function NotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StyledText>Not found.</StyledText>

      <Pressable onPress={() => navigation.navigate("Root")}>
        <StyledText>Go to start</StyledText>
      </Pressable>
    </View>
  );
}
