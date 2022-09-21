import { Platform, Pressable, StyleSheet, View, Text } from "react-native";

import {
  RootStackParamList,
  RootStackScreenProps,
  RootTabScreenProps,
} from "../types";

// Not in use, but great reference for later
export default function ModalScreen({
  navigation,
}: RootStackScreenProps<"Modal">) {
  return (
    <View style={styles.container}>
      <Pressable
        style={{ position: "absolute", top: 10, right: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.title}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
