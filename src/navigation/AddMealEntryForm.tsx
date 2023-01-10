import { Ionicons } from "@expo/vector-icons";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Keyboard, View } from "react-native";
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

interface InputTypeSelectorProps {
  onSelect(type: InputType): void;
}

interface FinalInputFormCommonProps {
  onSubmit(meal: Meal): void;
  onGoBack(): void;
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

function InputTypeSelector(props: InputTypeSelectorProps) {
  return (
    <View style={tw`h-full justify-center`}>
      <View style={tw`flex`}>
        <Button
          style={tw`w-full h-32 flex items-center justify-center bg-gray-300`}
          onPress={() => props.onSelect(InputType.Weight)}
        >
          <View style={tw`items-center`}>
            <Ionicons size={32} color={tw.color("black")} name="cafe" />
            <StyledText size="lg" style={tw`mt-1 ml-3 text-black`}>
              By weight
            </StyledText>
          </View>
        </Button>

        <Button
          style={tw`mt-4 w-full h-32 items-center justify-center bg-gray-200`}
          onPress={() => props.onSelect(InputType.DirectValues)}
        >
          <View style={tw`items-center`}>
            <Ionicons size={32} color={tw.color("black")} name="options" />
            <StyledText size="lg" style={tw`mt-1 ml-3 text-black`}>
              By direct values
            </StyledText>
          </View>
        </Button>
      </View>
    </View>
  );
}

function FinalInputFormButtons(props: { onGoBack(): void; onSubmit(): void }) {
  return (
    <View style={tw`flex-row mt-4`}>
      <Button
        style={tw`bg-gray-400 w-1/5 mr-2`}
        onPress={() => props.onGoBack()}
      >
        <StyledText style={tw`text-black text-center`}>Back</StyledText>
      </Button>

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
    <View style={tw`pt-6`}>
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
        onGoBack={props.onGoBack}
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
    <View style={tw`pt-6`}>
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
                tw`rounded bg-gray-300 text-black z-20`,
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
        onGoBack={props.onGoBack}
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
        duration: 200,
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
        tw`absolute inset-0 bg-white z-60 px-4 justify-between ${
          isContainerOpen ? "flex" : "hidden"
        }`,
        { opacity: containerOpacityRef },
      ]}
    >
      <View>{props.children}</View>

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
          style={tw`justify-center items-center rounded-full bg-gray-800 shadow h-16 w-16`}
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
    const date = new Date();

    await history.add({
      ...meal,
      dateIso: date.toISOString(),
      dateReadable: date.toLocaleDateString(),
    });
    reset();
    Keyboard.dismiss();
  }

  return (
    <Wrapper
      onClose={() => {
        props.onClose();
      }}
      isOpen={props.isOpen}
      reset={reset}
    >
      {inputType === InputType.DirectValues ? (
        <FinalDirectValuesInputForm
          onGoBack={() => setInputType(null)}
          onSubmit={add}
        />
      ) : inputType === InputType.Weight ? (
        <FinalWeightInputForm
          onGoBack={() => setInputType(null)}
          onSubmit={add}
        />
      ) : (
        <InputTypeSelector onSelect={setInputType} />
      )}
    </Wrapper>
  );
}
