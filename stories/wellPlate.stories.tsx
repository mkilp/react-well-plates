import { Meta } from '@storybook/react'; // Keep for Storybook metadata
import React from 'react';
import { View, Text } from 'react-native'; // Added for RN elements

import { IWellPlateProps, WellPlate } from '../src';

export default {
  title: 'Example/WellPlate',
  component: WellPlate,
  args: { // Default args for all stories under this title
    rows: 8,
    columns: 12,
  },
} as Meta;

// This story uses the default args
export function Control(props: IWellPlateProps) {
  return <WellPlate {...props} />;
}

export function SmallWellPlate() {
  return (
    <WellPlate
      rows={8}
      columns={12}
      wellSize={30}
      // wellStyle is expected to return StyleProp<ViewStyle | TextStyle> by the Well component.
      // If the style is meant for the Text inside the Well, it should be passed via textStyle prop of Well,
      // or renderText should return a Text component with this style.
      // For now, assuming wellStyle applies to the container. fontSize is not a ViewStyle prop.
      // If the intent was to style the text, this needs to be handled differently.
      // Given the original was CSS, it likely applied to the text content.
      // Let's use renderText to achieve this for clarity.
      renderText={({ label }) => (
        <Text style={{ fontSize: 10 }}>{label}</Text>
      )}
    />
  );
}

export function LargeWellPlate() {
  return <WellPlate rows={8} columns={12} wellSize={60} />;
}

export function CustomWellPlate() {
  return (
    <WellPlate
      rows={8}
      columns={12}
      wellSize={50}
      headerText={({ position }) => {
        if (position.column > 5) {
          return String(position.column); // Ensure text node for numbers
        } else if (position.column > 3) {
          return null;
        } else if (position.column > 2) {
          return '';
        } else if (position.row > 6) {
          return String(position.row); // Ensure text node for numbers
        } else if (position.row === 4) {
          return null;
        } else if (position.row === 3) {
          return '';
        }
        return undefined; // Default
      }}
      renderText={({ index, label }) => { // Added label for default case
        if (index === 0) {
          return null;
        } else if (index === 1) {
          return '';
        } else if (index === 2) {
          // Example: returning a custom Text component
          return <Text style={{ color: 'blue', fontStyle: 'italic' }}>Custom</Text>;
        } else {
          // Original structure converted to RN
          return (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12 }}>test</Text>
              <Text style={{ fontSize: 12 }}>{index}</Text>
            </View>
          );
        }
      }}
      wellStyle={({ label, wellPlate }) => {
        const factor = Math.round(
          (wellPlate.getPosition(label, 'index') /
            (wellPlate.rows * wellPlate.columns)) *
            120 +
            (255 - 120),
        );
        return {
          backgroundColor: `rgb(${factor}, ${factor}, ${factor})`,
          borderColor: 'green',
          borderWidth: 2,
          // fontSize here would be invalid if it's for the container (ViewStyle)
          // If this style was intended for text, it should be applied via renderText or a textStyle prop.
        };
      }}
    />
  );
}
