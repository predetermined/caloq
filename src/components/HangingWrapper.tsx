import { PropsWithChildren } from "react";
import { View } from "react-native";
import { tw } from "../lib/tw";

export function HangingWrapper(props: PropsWithChildren<unknown>) {
  return (
    <View
      style={[
        tw`rounded-b-xl p-4 pt-6 bg-gray-100`,
        {
          elevation: 7,
          shadowColor: tw.color("black opacity-50"),
        },
      ]}
    >
      {props.children}
    </View>
  );
}
