import React, {
  FunctionComponent,
  useMemo,
  useState,
  useCallback,
  useEffect, // Keep for now, might remove if no other effects are used
  ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  // Pressable, // WellPlateInternal uses Pressable internally
  ViewStyle,
  // TextStyle, // If textCallback returns complex Text nodes with specific styles
  StyleProp,
  GestureResponderEvent,
  // Platform, // Not using Platform for now as ctrlKey logic is removed
} from 'react-native';
import { WellPlate, PositionFormat, SubsetMode } from 'well-plates';

import { Cell } from './WellPlate'; // Assuming WellPlate.tsx is converted and Cell is RN compatible
// Assuming WellPlateInternal is correctly exported and converted from './util/WellPlateInternal'
import { WellPlateInternal } from './util/WellPlateInternal';

export type RangeSelectionMode = 'zone' | 'columns' | 'rows' | 'off';

interface PickCell extends Cell {
  disabled: boolean;
  booked: boolean; // 'booked' state might be less relevant if range selection changes
  selected: boolean;
}

// Type for the style prop function, now returning React Native styles
type StyleParam = (cell: PickCell) => StyleProp<ViewStyle>;

// Converted defaultWellStyles (was CSSProperties)
const defaultWellStyles: ViewStyle = {
  // userSelect, WebkitUserSelect, cursor removed
  // Add any default RN styles if needed, e.g., default border if not in Well component itself
};

// Converted defaultWellPickerStyle (was StyleParam returning CSSProperties)
const defaultWellPickerStyle: StyleParam = ({ booked, disabled, selected }) => {
  const styles: ViewStyle = {
    borderColor: 'black', // Default, can be overridden by Well component's own style
  };
  // 'booked' state styling might change/be removed depending on range selection rework
  if (booked) {
    styles.borderColor = 'orange';
  }
  if (disabled) {
    styles.backgroundColor = 'lightgray';
  }
  if (selected) {
    styles.backgroundColor = 'lightgreen';
  }
  return styles;
};

export interface IWellPickerProps {
  displayAsGrid?: boolean;
  wellSize?: number;
  rows: number;
  columns: number;
  format?: PositionFormat;
  value: Array<number | string>;
  disabled?: Array<number | string>;
  onChange: (value: number[], label: string[]) => void;
  style?: StyleParam; // Updated type
  // className?: ClassNameParam; // Removed
  renderText?: (cell: PickCell) => ReactNode;
  rangeSelectionMode?: RangeSelectionMode; // This feature is impacted by event changes
  pickMode?: boolean;
}

export const MultiWellPicker: FunctionComponent<IWellPickerProps> = ({
  rows,
  columns,
  format,
  value,
  renderText: text = ({ label }) => <Text>{label}</Text>, // Ensure text returns RN compatible nodes
  disabled = [],
  onChange,
  style = defaultWellPickerStyle,
  // className, // Removed
  rangeSelectionMode = 'zone', // Functionality significantly reduced
  pickMode = true,
  ...wellPlateProps // These are props for WellPlateInternal
}) => {
  const wellPlate = useMemo(() => {
    return new WellPlate({ rows, columns, positionFormat: format });
  }, [rows, columns, format]);

  const valueSet = useMemo(() => {
    return new Set(value.map((label) => wellPlate.getPosition(label, 'index')));
  }, [value, wellPlate]);

  const disabledSet = useMemo(() => {
    return new Set(
      disabled.map((label) => wellPlate.getPosition(label, 'index')),
    );
  }, [disabled, wellPlate]);

  // Range selection state: startWell and bookedSet functionality is severely impacted
  // by the removal of mouse-specific events (onEnter, global mouseup).
  // These will need a different interaction model (e.g., PanResponder) for full functionality.
  const [startWell, setStartWell] = useState<number | null>(null);
  const [bookedSet, setBooked] = useState(new Set<number>());

  // selectRange: Called by onEnter in the original, which is no longer available.
  // This function will not be effectively called in its current form.
  const selectRange = useCallback(
    (start: number, end: number) => {
      if (rangeSelectionMode === 'off') return;
      let range: number[];
      switch (rangeSelectionMode) {
        case 'zone':
          range = wellPlate.getPositionSubset(start, end, SubsetMode.zone, 'index');
          break;
        case 'columns':
        case 'rows':
          range = wellPlate.getPositionSubset(
            start,
            end,
            rangeSelectionMode === 'columns' ? SubsetMode.columns : SubsetMode.rows,
            'index',
          );
          break;
        default:
          throw new Error('invalid range selection mode');
      }
      setBooked(new Set(range));
    },
    [rangeSelectionMode, wellPlate],
  );

  // bookSelection: Originally called by the 'clear' function (triggered by global mouseup/mouseleave).
  // This logic will also need a new trigger.
  const bookSelection = useCallback(
    (toggle: boolean) => {
      if (bookedSet.size === 0) return;
      const newValue = new Set<number>();

      for (const bookedEl of bookedSet) {
        if (!disabledSet.has(bookedEl)) {
          if (toggle) {
            if (!valueSet.has(bookedEl)) {
              newValue.add(bookedEl);
            }
          } else {
            newValue.add(bookedEl);
          }
        }
      }

      if (toggle) {
        for (const selected of valueSet) {
          if (!bookedSet.has(selected)) {
            newValue.add(selected);
          }
        }
      }
      const newArray = Array.from(newValue);
      onChange(
        newArray,
        newArray.map((val) => wellPlate.getPosition(val, 'formatted')),
      );
    },
    [bookedSet, onChange, disabledSet, valueSet, wellPlate],
  );

  const toggleWell = useCallback(
    (well: number) => {
      if (valueSet.has(well)) {
        const valueSetCopy = new Set(valueSet);
        valueSetCopy.delete(well);
        const newValue = Array.from(valueSetCopy);
        onChange(
          newValue,
          newValue.map((val) => wellPlate.getPosition(val, 'formatted')),
        );
      } else if (disabledSet.has(well)) {
        // ignore disabled wells
      } else {
        const newValue = [...Array.from(valueSet), well];
        onChange(
          newValue,
          newValue.map((val) => wellPlate.getPosition(val, 'formatted')),
        );
      }
    },
    [valueSet, onChange, disabledSet, wellPlate],
  );

  // classNameCallback removed

  const textCallback = useCallback<(index: number) => ReactNode>(
    (index) => {
      const cellData: PickCell = {
        index,
        label: wellPlate.getPosition(index, 'formatted'),
        wellPlate,
        position: wellPlate.getPosition(index, 'row_column'),
        booked: bookedSet.has(index), // booked state might be less relevant
        selected: valueSet.has(index),
        disabled: disabledSet.has(index),
      };
      return text(cellData);
    },
    [text, wellPlate, bookedSet, valueSet, disabledSet],
  );

  const styleCallback = useCallback<(index: number) => StyleProp<ViewStyle>>(
    (index) => {
      const cellData: PickCell = {
        index,
        label: wellPlate.getPosition(index, 'formatted'),
        wellPlate,
        position: wellPlate.getPosition(index, 'row_column'),
        booked: bookedSet.has(index),
        selected: valueSet.has(index),
        disabled: disabledSet.has(index),
      };
      // Combines default (empty for now) with user-provided style
      return [defaultWellStyles, style(cellData)];
    },
    [style, wellPlate, bookedSet, valueSet, disabledSet],
  );

  // The 'clear' function and its associated useEffect for global listeners are removed.
  // This changes how range selection is finalized.
  // A new mechanism (e.g., button, specific gesture release) would be needed to call bookSelection.

  // Event handlers for WellPlateInternal:
  // onEnter and onLeave are removed as they are not supported by RN Well component.
  // This impacts range selection significantly.
  const handleWellMouseDown = (well: number, event: GestureResponderEvent) => {
    // Original logic: setStartWell, and if not shift/ctrl key, call onChange.
    // For RN, complex gestures (like drag for range) need PanResponder.
    // Simple tap is handled by onClick. onPressIn could be start of a custom gesture.
    if (disabledSet.has(well)) return;

    setStartWell(well); // Still useful if a PanResponder is added later for drag-select
    
    // Simple click behavior on mouse down: if not in pickMode (toggle mode), treat as direct selection.
    // This might differ from original which used shift/ctrl.
    // If rangeSelectionMode is 'off' or if complex selection is not active,
    // a press might immediately select a single well.
    if (rangeSelectionMode === 'off' || !pickMode) { // Simplified condition
        if (!disabledSet.has(well)) {
            onChange([well], [wellPlate.getPosition(well, 'formatted')]);
        } else {
            onChange([], []);
        }
    }
    // If pickMode is on, onClick will handle toggling.
  };

  const handleWellClick = (well: number, event: GestureResponderEvent) => {
    // Original logic: if shiftKey or ctrlKey, toggle well if pickMode is true.
    // RN: GestureEvent has no shift/ctrl. Behavior relies on pickMode.
    if (disabledSet.has(well)) return;

    if (pickMode) {
      toggleWell(well);
    }
    // If a range selection was in progress (startWell is set),
    // a click could also signify the end of a two-tap selection.
    // However, the original relied on mouseup/mouseleave for this via 'clear'.
    // For now, a click on a well while pickMode is true will just toggle it.
    // If startWell is set, it means a press started. This click could be the 'release'.
    if (startWell !== null && rangeSelectionMode !== 'off') {
        // This is a potential point to finalize a selection if not using drag.
        // For example, if startWell is set, this click could be the 'end' tap.
        // selectRange(startWell, well); // Select the range
        // bookSelection(false); // Book it (false for overwrite, true for toggle)
        // setStartWell(null); // Reset selection start
        // This part is commented out as it needs careful design for UX.
    }

  };
  
  // onMouseUp on a well could also be a place to finalize selection.
  const handleWellMouseUp = (well: number, event: GestureResponderEvent) => {
    if (startWell !== null && rangeSelectionMode !== 'off') {
      // If a selection was started (startWell is set),
      // releasing the touch could finalize the range.
      selectRange(startWell, well); // This sets the 'bookedSet'
      bookSelection(false); // This commits the 'bookedSet' to the actual value. 'false' means overwrite.
                           // Use 'true' if you want to toggle/add to existing selection.
      setStartWell(null); // Reset for next selection.
      setBooked(new Set()); // Clear the temporary booked set.
    }
  };


  return (
    <WellPlateInternal
      {...wellPlateProps}
      plate={wellPlate}
      wellStyle={styleCallback}
      // wellClassName prop removed
      text={textCallback}
      // onEnter/onLeave removed, impacting range selection
      onMouseDown={handleWellMouseDown}
      onClick={handleWellClick}
      onMouseUp={handleWellMouseUp} // New: using onMouseUp to finalize range selection
    />
  );
};

// isCtrlKey function removed as it's web-specific.

// Basic StyleSheet (can be expanded)
const styles = StyleSheet.create({
  // Add any container styles for MultiWellPicker if needed
});
