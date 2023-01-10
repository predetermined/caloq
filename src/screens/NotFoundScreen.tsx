import { Pressable, View } from "react-native";
import { StyledText } from "../components/StyledText";
import { tw } from "../lib/tw";

import { RootStackScreenProps } from "../types";

export function NotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  return (
    <View style={tw`items-center justify-center`}>
      <StyledText>Not found.</StyledText>

      <Pressable onPress={() => navigation.navigate("Root")}>
        <StyledText>Go to start</StyledText>
      </Pressable>
    </View>
  );
}
