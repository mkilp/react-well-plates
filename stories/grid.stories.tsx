import { Meta } from '@storybook/react'; // Keep for Storybook metadata
import React, { useState } from 'react'; // CSSProperties removed
import { View, Text } from 'react-native'; // Added for RN elements

// Assuming IWellPickerProps is correctly exported from ../src after its own conversion
import { MultiWellPicker, WellPlate, IWellPickerProps } from '../src';

export default {
  title: 'Example/GridWellPlate',
  component: WellPlate,
  argTypes: {
    rows: {
      // defaultValue: 8, // defaultValue in argTypes might be web-specific, check SB RN docs if needed
      control: 'number',
    },
    columns: {
      // defaultValue: 12,
      control: 'number',
    },
  },
} as Meta;

export function GridWellPlate() {
  return (
    <WellPlate
      rows={8}
      columns={12}
      displayAsGrid
      headerStyle={({ position }) => {
        if (position.column % 2 === 0 && position.row === -1) {
          return {
            backgroundColor: 'rgb(202, 128, 245)',
          };
        }

        if (position.row % 2 === 0 && position.column === -1) {
          return {
            backgroundColor: 'rgb(204, 211, 243)',
          };
        }
        return {}; // Ensure a default return
      }}
      wellStyle={({ position }) => {
        if (position.column % 2 === 0 && position.row % 2 === 0) {
          return {
            backgroundColor: 'rgb(202, 169, 204)',
          };
        } else if (position.column % 2 === 0 && position.row % 2 !== 0) {
          return {
            backgroundColor: 'rgb(202, 128, 245)',
          };
        } else if (position.column % 2 !== 0 && position.row % 2 === 0) {
          return {
            backgroundColor: 'rgb(204, 211, 243)',
          };
        } else {
          return {
            backgroundColor: 'white',
          };
        }
      }}
    />
  );
}

export function CustomGridWellPlate() {
  return (
    <WellPlate
      displayAsGrid
      rows={8}
      columns={12}
      wellSize={50}
      headerText={({ position }) => {
        if (position.column > 5) {
          return String(position.column); // Ensure text node
        } else if (position.column > 3) {
          return null; // Valid
        } else if (position.column > 2) {
          return ''; // Valid
        } else if (position.row > 6) {
          return String(position.row); // Ensure text node
        } else if (position.row === 4) {
          return null; // Valid
        } else if (position.row === 3) {
          return ''; // Valid
        }
        return undefined; // Default
      }}
      renderText={({ index }) => {
        if (index === 0) {
          return undefined;
        } else if (index === 1) {
          return null;
        } else if (index === 2) {
          return '';
        } else {
          return (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12 }}>test</Text>
              <Text style={{ fontSize: 12 }}>{index}</Text>
            </View>
          );
        }
      }}
      wellStyle={({ wellPlate, index }) => {
        const factor = Math.round(
          (index / (wellPlate.rows * wellPlate.columns)) * 120 + (255 - 120),
        );
        return {
          backgroundColor: `rgb(${factor}, ${factor}, ${factor})`,
        };
      }}
    />
  );
}

export function CustomWellPicker() {
  return (
    <StateFullWellPicker
      displayAsGrid
      rows={8}
      columns={12}
      wellSize={50}
      renderText={({ index, label }) => {
        return (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12 }}>{label}</Text>
            <Text style={{ fontSize: 12 }}>{index}</Text>
          </View>
        );
      }}
      value={[14]}
      disabled={[5, 20]}
      rangeSelectionMode="zone" // This prop's functionality changed in WellPicker conversion
      style={({ index, wellPlate, disabled, booked, selected }) => {
        const position = wellPlate.getPosition(index, 'row_column');
        // Style returned should be ViewStyle
        const styles: import('react-native').ViewStyle = {};
        if (disabled) {
          if (position.row === 1) {
            styles.backgroundColor = 'grey';
          } else {
            styles.backgroundColor = 'lightgray';
          }
        }
        if (selected) {
          styles.backgroundColor = 'pink';
        }
        if (booked && !disabled) {
          styles.borderColor = 'red'; // booked is less relevant now
        }
        return styles;
      }}
    />
  );
}

// Omit onChange from IWellPickerProps as StateFullWellPicker handles it.
type IStateFullWellPickerProps = Omit<IWellPickerProps, 'onChange' | 'value'> & { value: Array<number|string> };


function StateFullWellPicker(props: IStateFullWellPickerProps) {
  const { value: initialValue, ...otherProps } = props;
  const [value, setValue] = useState(
    initialValue.map((val) => (typeof val === 'string' ? val : Number(val))), // Ensure numbers if needed by component
  );

  const handleChange = (newValue: number[], newLabels: string[]) => {
    setValue(newValue);
  };

  return (
    <MultiWellPicker
      value={value}
      onChange={handleChange}
      {...otherProps}
    />
  );
}
