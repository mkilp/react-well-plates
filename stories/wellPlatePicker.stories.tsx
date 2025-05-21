import { Meta } from '@storybook/react'; // Keep for Storybook metadata
import React, { useState } from 'react'; // CSSProperties removed
import { View, Text } from 'react-native'; // Added for RN elements

// Assuming IWellPickerProps is correctly exported from ../src after its own conversion
import { IWellPickerProps, MultiWellPicker } from '../src';

export default {
  title: 'Example/MultiWellPicker',
  component: MultiWellPicker,
  args: { // Default args for all stories under this title
    rows: 8,
    columns: 12,
    value: [8], // Ensure value type matches component (number[] or string[])
    disabled: [2], // Ensure disabled type matches component
  },
} as Meta;

// This story uses the default args via StateFullWellPicker
export function WellPicker(props: IWellPickerProps) {
  // StateFullWellPicker expects 'value' in its own props to be initialValue
  // and MultiWellPicker's 'value' prop is handled internally by StateFullWellPicker's state.
  // The props passed here should align with IWellPickerProps,
  // and StateFullWellPicker correctly spreads them.
  return <StateFullWellPicker {...props} />;
}

export function CustomWellPicker() {
  return (
    <StateFullWellPicker
      rows={8}
      columns={12}
      wellSize={50}
      renderText={({ index, label }) => {
        // Converted to React Native elements
        return (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12 }}>{label}</Text>
            <Text style={{ fontSize: 12 }}>{index}</Text>
          </View>
        );
      }}
      value={[14]} // initialValue for StateFullWellPicker
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
        if (booked && !disabled) { // 'booked' state is less relevant now
          styles.borderColor = 'red';
        }
        return styles;
      }}
    />
  );
}

// Omit onChange from IWellPickerProps for StateFullWellPicker's own props,
// as it defines its own onChange handler to manage state.
// Also, 'value' in IStateFullWellPickerProps is the initialValue.
type IStateFullWellPickerProps = Omit<IWellPickerProps, 'onChange' | 'value'> & {
  value: Array<number | string>; // Initial value
};

function StateFullWellPicker(props: IStateFullWellPickerProps) {
  const { value: initialValue, ...otherProps } = props;
  // Ensure the state 'value' is consistently number[] as expected by MultiWellPicker's onChange
  const [value, setValue] = useState<number[]>(
    initialValue.map((val) => wellPlateInstanceForState.getPosition(val, 'index')),
  );
  
  // Create a dummy wellPlate instance just for the initial mapping in useState.
  // This is a bit of a hack due to not having access to the actual wellPlate instance
  // from MultiWellPicker at this point for the initial state conversion.
  // This assumes rows/columns from otherProps or default args are available.
  // A better approach might be to pass rows/columns explicitly to StateFullWellPicker if not in otherProps.
  const { rows = 8, columns = 12, format = undefined } = otherProps as IWellPickerProps;
  const [wellPlateInstanceForState] = useState(() => new (require('well-plates')).WellPlate({rows, columns, positionFormat: format }));


  const handleChange = (newValue: number[], newLabels: string[]) => {
    setValue(newValue);
  };

  return (
    <MultiWellPicker
      {...(otherProps as IWellPickerProps)} // Spread other props
      value={value} // Pass current state value
      onChange={handleChange} // Pass the state updater
    />
  );
}
