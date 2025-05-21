import React, { ReactNode, FunctionComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { WellPlate } from 'well-plates';

interface IWellProps {
  size: number;
  value: number;
  wellPlate: WellPlate;
  text?: (index: number) => ReactNode;
  onClick?: (value: number, e: GestureResponderEvent) => void;
  // onEnter and onLeave are omitted as they don't have direct Pressable equivalents.
  // This is a deviation from the original web component.
  onMouseUp?: (value: number, e: GestureResponderEvent) => void;
  onMouseDown?: (value: number, e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  // textStyle prop can be added if specific text styling is needed independent of the well's container style
  textStyle?: StyleProp<TextStyle>;
}

const Well: FunctionComponent<IWellProps> = (props) => {
  const {
    size,
    value,
    wellPlate,
    text,
    onClick,
    onMouseDown,
    onMouseUp,
    style: customStyle,
    textStyle: customTextStyle,
  } = props;

  const wellMargin = Math.round(size / 12);
  const wellDiameter = size - 2 * wellMargin;

  const dynamicWellStyle: ViewStyle = {
    width: wellDiameter,
    height: wellDiameter,
    margin: wellMargin,
    borderRadius: wellDiameter / 2, // For a perfect circle
  };

  // Extract backgroundColor for the well and color for the text from customStyle if it's an object
  let backgroundColor: string | undefined;
  let textColor: string | undefined;

  if (StyleSheet.flatten(customStyle)?.backgroundColor) {
    backgroundColor = StyleSheet.flatten(customStyle).backgroundColor as string;
  }
  if (StyleSheet.flatten(customStyle)?.color) {
    textColor = StyleSheet.flatten(customStyle).color as string;
  }
  
  // If customTextStyle provides color, it takes precedence for the text
  if (StyleSheet.flatten(customTextStyle)?.color) {
    textColor = StyleSheet.flatten(customTextStyle).color as string;
  }


  const displayableValue = text
    ? text(value)
    : wellPlate.getPosition(value, 'formatted');

  return (
    <Pressable
      onPress={onClick && ((e) => onClick(value, e))}
      onPressIn={onMouseDown && ((e) => onMouseDown(value, e))}
      onPressOut={onMouseUp && ((e) => onMouseUp(value, e))}
      style={[
        styles.baseWell,
        dynamicWellStyle,
        backgroundColor ? { backgroundColor } : {}, // Apply backgroundColor here
        customStyle, // Allow full override and other properties like borderColor
      ]}
    >
      <Text
        style={[
          styles.textStyle,
          textColor ? { color: textColor } : {}, // Apply textColor here
          customTextStyle, // Allow override of text styles
        ]}
      >
        {displayableValue}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseWell: {
    borderWidth: 1,
    borderStyle: 'solid', // Solid is default in RN, but good to be explicit
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#000', // Default border color, can be overridden by customStyle
  },
  textStyle: {
    textAlign: 'center',
    // Default text color can be set here if needed, e.g., color: '#000'
    // It will be overridden by customStyle.color or customTextStyle.color
  },
});

export default Well;
