import React, {
  FunctionComponent,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import {
  ViewStyle,
  // TextStyle, // Only if headerStyle specifically needs to return TextStyle and not just ViewStyle for the container
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import {
  WellPlate as WellPlateClass,
  PositionFormat,
  RowColumnPosition,
} from 'well-plates';

import { WellPlateInternal } from './util/WellPlateInternal';
import { IWellPlateCommonProps } from './util/types'; // Assuming this is RN compatible or doesn't have web types

export interface Cell {
  index: number;
  label: string;
  wellPlate: WellPlateClass;
  position: RowColumnPosition;
}

export interface HeaderCell {
  label: string;
  position: RowColumnPosition;
}

export interface IWellPlateProps extends IWellPlateCommonProps {
  rows: number;
  columns: number;
  format?: PositionFormat;
  displayAsGrid?: boolean;

  // wellClassName removed
  renderText?: (cell: Cell) => ReactNode;
  wellStyle?: (cell: Cell) => StyleProp<ViewStyle>;

  // headerClassName removed
  headerStyle?: (cell: HeaderCell) => StyleProp<ViewStyle>; // Keeping as ViewStyle for container
  headerText?: (cell: HeaderCell) => ReactNode;

  onClick?: (
    value: number,
    label: string,
    wellPlate: WellPlateClass,
    e: GestureResponderEvent,
  ) => void;
  // onEnter and onLeave removed
  onMouseDown?: (
    value: number,
    label: string,
    wellPlate: WellPlateClass,
    e: GestureResponderEvent,
  ) => void;
  onMouseUp?: (
    value: number,
    label: string,
    wellPlate: WellPlateClass,
    e: GestureResponderEvent,
  ) => void;
}

export const WellPlate: FunctionComponent<IWellPlateProps> = (props) => {
  const {
    rows,
    columns,
    format,
    onClick,
    onMouseDown,
    onMouseUp,
    // onLeave, // Removed
    // onEnter, // Removed
    wellStyle,
    // wellClassName, // Removed
    renderText: text,
    headerStyle,
    // headerClassName, // Removed
    ...otherProps
  } = props;

  const wellPlate = useMemo(() => {
    return new WellPlateClass({ rows, columns, positionFormat: format });
  }, [rows, columns, format]);

  const onClickCallback = useCallback(
    (value: number, e: GestureResponderEvent) => {
      const label = wellPlate.getPosition(value, 'formatted');
      if (onClick) onClick(value, label, wellPlate, e);
    },
    [onClick, wellPlate],
  );

  const onMouseDownCallback = useCallback(
    (value: number, e: GestureResponderEvent) => {
      const label = wellPlate.getPosition(value, 'formatted');
      if (onMouseDown) onMouseDown(value, label, wellPlate, e);
    },
    [onMouseDown, wellPlate],
  );

  const onMouseUpCallback = useCallback( // Added this callback for completeness, though not in original snippet's destructuring
    (value: number, e: GestureResponderEvent) => {
      const label = wellPlate.getPosition(value, 'formatted');
      // Assuming onMouseUp prop exists and is being passed through otherProps or needs to be explicitly handled
      if (props.onMouseUp) props.onMouseUp(value, label, wellPlate, e);
    },
    [props.onMouseUp, wellPlate],
  );


  const wellStyleCallback = useCallback(
    (index: number): StyleProp<ViewStyle> => {
      const label = wellPlate.getPosition(index, 'formatted');
      const position = wellPlate.getPosition(index, 'row_column');
      const cell: Cell = { index, label, wellPlate, position };
      // userSelect and WebkitUserSelect removed
      return wellStyle?.(cell) || {}; // Return empty object if no style is provided
    },
    [wellStyle, wellPlate],
  );

  const headerStyleCallback = useCallback(
    (cell: HeaderCell): StyleProp<ViewStyle> => {
      // userSelect and WebkitUserSelect removed
      return headerStyle?.(cell) || {}; // Return empty object if no style is provided
    },
    [headerStyle],
  );

  // wellClassNameCallback removed

  const textCallback = useCallback(
    (index: number) => {
      const label = wellPlate.getPosition(index, 'formatted');
      const position = wellPlate.getPosition(index, 'row_column');
      const cell: Cell = { index, label, wellPlate, position };

      if (text) return text(cell);
      // Default behavior in WellPlateInternal is to show formatted position if text() is undefined.
      // Here, if text prop is provided, we call it. If not, WellPlateInternal handles default.
      // So, we can return undefined if text prop is not given, or text(cell) if it is.
      return text ? text(cell) : undefined; // Let WellPlateInternal handle default text
    },
    [text, wellPlate],
  );

  return (
    <WellPlateInternal
      plate={wellPlate}
      onClick={onClickCallback}
      text={textCallback}
      onMouseDown={onMouseDownCallback}
      onMouseUp={onMouseUpCallback} // Pass the new onMouseUpCallback
      // onLeave and onEnter props removed from WellPlateInternal
      wellStyle={wellStyleCallback}
      // wellClassName prop removed from WellPlateInternal
      headerStyle={headerStyleCallback}
      // headerClassName prop removed from WellPlateInternal
      {...otherProps}
    />
  );
};
