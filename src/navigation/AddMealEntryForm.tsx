import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Keyboard, Pressable, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button } from "../components/Button";
import { Label } from "../components/Label";
import { StyledText } from "../components/StyledText";
import { StyledTextInput } from "../components/StyledTextInput";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "../constants/layout";
import { AppContext } from "../contexts/appContext";
import { useKeyboard } from "../hooks/useKeyboard";
import { Meal } from "../hooks/useMeals";
import {
  EMPTY_NUTRIONAL_VALUES_STRINGS,
  NUTRIONAL_METRICS,
  OptionKey,
} from "../hooks/useNutrionalValuePreferences";
import { tw } from "../lib/tw";

enum InputType {
  Weight = "weight",
  DirectValues = "direct_values",
}

interface FinalInputFormCommonProps {
  onSubmit(meal: Meal): void;
}

function getValuesThatAreBeingAdded(
  nutrionalValues: Record<string, string>,
  grams: number
) {
  return Object.keys(NUTRIONAL_METRICS).reduce((values, _key) => {
    const key = _key as OptionKey;
    const n = Number.isNaN(Number(nutrionalValues[key]))
      ? 0
      : Number(nutrionalValues[key]);

    return {
      ...values,
      [key]: Math.round(grams * (n / 100)),
    };
  }, {}) as Record<OptionKey, number>;
}

function NumberPreview({
  values,
}: {
  values: Record<keyof typeof NUTRIONAL_METRICS, number>;
}) {
  const { nutrionalValuePreferences, hidingNumbers } = useContext(AppContext);

  return (
    <StyledText style={tw`mt-4 text-center justify-center`}>
      {nutrionalValuePreferences.enabledValues.map((key, i) => {
        return (
          <StyledText size="xs" style={tw`text-gray-600`} key={key}>
            {i === 0 ? null : " • "}
            <StyledText size="xs">
              {hidingNumbers.isHiding ? "X" : values[key]}
              {NUTRIONAL_METRICS[key].representation.valueRelated.unit}
            </StyledText>{" "}
            {NUTRIONAL_METRICS[key].representation.valueRelated.suffix}
          </StyledText>
        );
      })}
    </StyledText>
  );
}

function InputTypeSelector(props: {
  onSelect(type: InputType): void;
  onClose(): void;
}) {
  return (
    <BlurView
      intensity={60}
      tint="light"
      style={tw`h-full rounded-t-xl bg-white pb-20 absolute inset-0 flex-row justify-center items-end`}
    >
      <Pressable onPress={props.onClose} style={tw`absolute inset-0`} />

      <View style={tw`flex w-4/6 shadow-lg pb-4 mb-1 z-10`}>
        <Button
          style={tw`rounded-b-0 flex-row items-center justify-start bg-gray-800`}
          onPress={() => props.onSelect(InputType.Weight)}
        >
          <Ionicons size={20} color="white" name="cafe" />
          <StyledText style={tw`ml-3 text-white`}>By weight</StyledText>
        </Button>

        <View style={tw`flex-row justify-center bg-gray-800`}>
          <View style={tw`h-0 border-b-2 border-gray-700 w-1/3`} />
        </View>

        <Button
          style={tw`rounded-t-0 flex-row items-center justify-start bg-gray-800`}
          onPress={() => props.onSelect(InputType.DirectValues)}
        >
          <Ionicons size={20} color="white" name="options" />
          <StyledText style={tw`ml-3 text-white`}>By direct values</StyledText>
        </Button>
      </View>
    </BlurView>
  );
}

function FinalInputFormButtons(props: { onSubmit(): void }) {
  return (
    <View style={tw`flex-row mt-4`}>
      <Button
        style={tw`bg-gray-800 flex-1 ml-2`}
        onPress={() => props.onSubmit()}
      >
        Add
      </Button>
    </View>
  );
}

function FinalDirectValuesInputForm(props: FinalInputFormCommonProps) {
  const [nutrionalValues, setNutrionalValues] = useState<
    Record<OptionKey, string>
  >(EMPTY_NUTRIONAL_VALUES_STRINGS);
  const { nutrionalValuePreferences } = useContext(AppContext);

  const valuesThatAreBeingAdded = getValuesThatAreBeingAdded(
    nutrionalValues,
    100
  );

  return (
    <View style={tw`pt-4`}>
      {nutrionalValuePreferences.enabledValues.map((key, i) => {
        return (
          <View key={key} style={tw`${i !== 0 ? "mt-4" : ""}`}>
            <Label>{NUTRIONAL_METRICS[key].label}</Label>
            <StyledTextInput
              value={nutrionalValues[key]}
              onChangeText={(value) =>
                setNutrionalValues({
                  ...nutrionalValues,
                  [key]: value,
                })
              }
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        );
      })}

      <NumberPreview values={valuesThatAreBeingAdded} />

      <FinalInputFormButtons
        onSubmit={() => props.onSubmit(valuesThatAreBeingAdded)}
      />
    </View>
  );
}

function FinalWeightInputForm(props: FinalInputFormCommonProps) {
  const [nutrionalValues, setNutrionalValues] = useState<
    Record<OptionKey, string>
  >(EMPTY_NUTRIONAL_VALUES_STRINGS);
  const [grams, setGrams] = useState("");
  const { nutrionalValuePreferences, meals } = useContext(AppContext);
  const [dropdownValue, setDropdownValue] = useState<
    string | "MANUALLY" | null
  >(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function selectMeal(
    mealKey: keyof typeof NUTRIONAL_METRICS | "MANUALLY" | null
  ) {
    setDropdownValue(mealKey);

    if (!mealKey || mealKey === "MANUALLY") {
      setNutrionalValues(EMPTY_NUTRIONAL_VALUES_STRINGS);
      return;
    }

    const meal = meals.entries[mealKey];

    const stringMeal = {} as Record<keyof typeof meal, string>;
    for (const [key, value] of Object.entries(meal)) {
      stringMeal[key as OptionKey] = String(value);
    }

    setNutrionalValues(stringMeal);
  }

  const dropdownItems = [
    { label: "Enter values manually", value: "MANUALLY" },
    ...Object.keys(meals.entries).map((entry) => {
      return {
        label: entry,
        value: entry,
      };
    }),
  ];

  const valuesThatAreBeingAdded = getValuesThatAreBeingAdded(
    nutrionalValues,
    Number(grams)
  );

  return (
    <View style={tw`pt-4`}>
      <View>
        <Label>Grams</Label>
        <StyledTextInput
          value={grams}
          onChangeText={(value) => setGrams(value)}
          placeholder="100"
          keyboardType="numeric"
        />
      </View>

      <View style={tw`mt-4`}>
        <Label>Nutrional values per 100g</Label>

        <View style={tw`rounded`}>
          <View style={tw``}>
            <DropDownPicker
              open={isDropdownOpen}
              setOpen={setIsDropdownOpen}
              items={dropdownItems}
              value={dropdownValue}
              setValue={(cb) => selectMeal(cb(dropdownValue))}
              style={[
                tw`rounded bg-gray-200 text-black z-20`,
                { borderWidth: 0 },
              ]}
              textStyle={tw`text-black`}
              dropDownContainerStyle={[
                tw`z-10 bg-gray-300`,
                { borderWidth: 0 },
              ]}
              dropDownDirection="BOTTOM"
              placeholder="Choose meal..."
              flatListProps={{ keyboardShouldPersistTaps: "handled" }}
              listMode="FLATLIST"
              labelStyle={[
                {
                  fontSize: DEFAULT_FONT_SIZE,
                  fontFamily: DEFAULT_FONT_FAMILY,
                },
              ]}
              placeholderStyle={[
                {
                  fontSize: DEFAULT_FONT_SIZE,
                  fontFamily: DEFAULT_FONT_FAMILY,
                },
                tw`text-gray-600`,
              ]}
              listItemLabelStyle={[
                {
                  fontSize: DEFAULT_FONT_SIZE,
                  fontFamily: DEFAULT_FONT_FAMILY,
                },
              ]}
              maxHeight={400}
            />
          </View>

          {nutrionalValuePreferences.enabledValues.map((key) => {
            return (
              <View
                key={key}
                style={tw`flex-row items-center justify-between mt-4`}
              >
                <Label style={tw`mb-0 w-1/4`}>
                  {NUTRIONAL_METRICS[key].label}
                </Label>
                <StyledTextInput
                  value={nutrionalValues[key]}
                  onChangeText={(value) => {
                    setDropdownValue("MANUALLY");
                    setNutrionalValues({
                      ...nutrionalValues,
                      [key]: value,
                    });
                  }}
                  style={[
                    {
                      fontSize: 12,
                    },
                    tw`w-3/4`,
                  ]}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            );
          })}
        </View>
      </View>

      <NumberPreview values={valuesThatAreBeingAdded} />

      <FinalInputFormButtons
        onSubmit={() => props.onSubmit(valuesThatAreBeingAdded)}
      />
    </View>
  );
}

function Wrapper(
  props: PropsWithChildren<{
    isOpen: boolean;
    onClose(): void;
    reset(): void;
    hasBackground?: boolean;
  }>
) {
  const { isKeyboardOpen } = useKeyboard();
  const [isContainerOpen, setIsContainerOpen] = useState(false);
  const containerOpacityRef = useRef(new Animated.Value(0)).current;
  const [isTopCloseButtonClickable, setIsTopCloseButtonClickable] =
    useState(false);
  const topCloseButtonOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props.isOpen) {
      setIsContainerOpen(true);
      Animated.timing(containerOpacityRef, {
        toValue: 1,
        useNativeDriver: true,
        duration: 175,
      }).start();
      return;
    }

    Animated.timing(containerOpacityRef, {
      toValue: 0,
      useNativeDriver: true,
      duration: 150,
    }).start(() => {
      setIsContainerOpen(false);
      props.reset();
    });
  }, [props.isOpen]);

  useEffect(() => {
    Animated.timing(topCloseButtonOpacityRef, {
      toValue: isKeyboardOpen ? 1 : 0,
      useNativeDriver: true,
      duration: 100,
    }).start(() => setIsTopCloseButtonClickable(isKeyboardOpen));
  }, [isKeyboardOpen]);

  return (
    <Animated.View
      style={[
        tw`absolute ${
          props.hasBackground ? "bg-white" : ""
        } inset-0 z-60 px-4 justify-between ${
          isContainerOpen ? "flex" : "hidden"
        }`,
        { opacity: containerOpacityRef },
      ]}
    >
      {props.children}

      {/* Top close button */}
      <Animated.View
        style={[
          tw`absolute top-0 right-0 mr-4 justify-start`,
          { opacity: topCloseButtonOpacityRef },
        ]}
      >
        <Button
          disabled={!isTopCloseButtonClickable}
          style={tw`justify-center items-center rounded-full bg-gray-800 shadow p-2`}
          onPress={props.onClose}
        >
          <Ionicons size={16} name="close" color="white" />
        </Button>
      </Animated.View>

      {/* Bottom close button */}
      <View
        style={tw`${
          !isKeyboardOpen ? "" : "hidden"
        } absolute bottom-0 left-0 right-0 flex-row justify-center pb-6`}
      >
        <Button
          style={tw`justify-center items-center rounded-full bg-gray-800 shadow h-16 w-16 mb-2`}
          onPress={props.onClose}
        >
          <Ionicons size={20} name="close" color="white" />
        </Button>
      </View>
    </Animated.View>
  );
}

export function AddMealEntryForm(props: { isOpen: boolean; onClose(): void }) {
  const { history } = useContext(AppContext);
  const [inputType, setInputType] = useState<InputType | null>(null);

  function reset() {
    setInputType(null);
  }

  async function add(meal: Meal) {
    Keyboard.dismiss();

    const date = new Date();

    await history.add({
      ...meal,
      dateIso: date.toISOString(),
      dateReadable: date.toLocaleDateString(),
    });
    props.onClose();
  }

  return (
    <Wrapper
      onClose={() => {
        props.onClose();
      }}
      isOpen={props.isOpen}
      reset={reset}
      hasBackground={!!inputType}
    >
      {inputType === InputType.DirectValues ? (
        <FinalDirectValuesInputForm onSubmit={add} />
      ) : inputType === InputType.Weight ? (
        <FinalWeightInputForm onSubmit={add} />
      ) : (
        <InputTypeSelector onClose={props.onClose} onSelect={setInputType} />
      )}
    </Wrapper>
  );
}
