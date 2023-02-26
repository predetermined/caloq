import { PropsWithChildren } from "react";
import { View } from "react-native";
import { tw } from "../lib/tw";

export function HangingWrapper(props: PropsWithChildren<unknown>) {
  return (
    <View style={[tw`rounded-b-xl p-4 bg-gray-100 shadow-lg`]}>
      {props.children}
    </View>
  );
}
