import React, { FunctionComponent, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { WellPlate as WellPlateClass } from 'well-plates';

import { HeaderCell } from '../WellPlate'; // This import might need adjustment if HeaderCell is not RN compatible

import Well from './Well'; // Assuming Well.tsx is already converted
import { IWellPlateCommonProps } from './types'; // Assuming types.ts is RN compatible

interface IWellPlateInternalProps extends IWellPlateCommonProps {
  plate: WellPlateClass;
  displayAsGrid?: boolean;
  // onEnter and onLeave are omitted as they are not supported by the RN Well component
  onMouseDown?: (index: number, e: GestureResponderEvent) => void;
  onMouseUp?: (index: number, e: GestureResponderEvent) => void;
  onClick?: (index: number, e: GestureResponderEvent) => void;

  text?: (index: number) => ReactNode;
  wellStyle?: (index: number) => StyleProp<ViewStyle>;

  // headerClassName removed
  headerStyle?: (cell: HeaderCell) => StyleProp<ViewStyle | TextStyle>; // Header can be Text or View
  headerText?: (cell: HeaderCell) => ReactNode;
}

export const WellPlateInternal: FunctionComponent<IWellPlateInternalProps> = (
  props,
) => {
  const { displayAsGrid = false } = props;

  if (!displayAsGrid) {
    return <DefaultWellPlateInternal {...props} />;
  }

  return <GridWellPlateInternal {...props} />;
};

function GridWellPlateInternal(
  props: Omit<IWellPlateInternalProps, 'displayAsGrid'>,
) {
  const {
    plate,
    wellSize = 40, // Default wellSize for calculations if not provided
    headerStyle: getHeaderStyle,
    headerText: getHeaderText,
    wellStyle: getWellStyle,
    text: getWellText,
    onClick,
    onMouseDown,
    onMouseUp,
  } = props;

  const columnLabels = plate.columnLabels;
  const rowLabels = plate.rowLabels;

  // Calculate sizes
  const headerCellSize = wellSize * 0.75; // Example: make header cells a bit smaller or configurable
  const wellPadding = 5; // As used in the original

  const renderHeaderCell = (
    label: string,
    position: { row: number; column: number },
    key: string | number,
    isCorner = false,
  ) => {
    const headerCell: HeaderCell = { label, position };
    const customHeaderStyle = getHeaderStyle?.(headerCell);
    const headerContent = getHeaderText?.(headerCell) ?? label;

    return (
      <View
        key={key}
        style={[
          styles.gridHeaderCell,
          { width: isCorner ? headerCellSize : wellSize, height: headerCellSize },
          customHeaderStyle,
        ]}
      >
        {typeof headerContent === 'string' ? (
          <Text style={styles.gridHeaderText}>{headerContent}</Text>
        ) : (
          headerContent
        )}
      </View>
    );
  };

  return (
    <View style={styles.gridContainer}>
      {/* Top Header Row (Empty Corner + Column Labels) */}
      <View style={styles.gridRow}>
        {renderHeaderCell('', { row: -1, column: -1 }, 'corner', true)}
        {columnLabels.map((label, colIdx) =>
          renderHeaderCell(
            label,
            { row: -1, column: colIdx },
            `header-col-${colIdx}`,
            false,
          ),
        )}
      </View>

      {/* Row Labels + Wells */}
      {rowLabels.map((rowLabel, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.gridRow}>
          {/* Row Header Cell */}
          {renderHeaderCell(
            rowLabel,
            { row: rowIdx, column: -1 },
            `header-row-${rowIdx}`,
            true,
          )}
          {/* Wells in this Row */}
          {columnLabels.map((_colLabel, colIdx) => {
            const position = { row: rowIdx, column: colIdx };
            const index = plate.getPosition(position, 'index');
            // const wellContent = getWellText?.(index) ?? plate.getPosition(position, 'formatted');

            // The div wrapper with event handlers is removed. Interactions are on Well itself.
            // The styling for padding and alignment is now part of Well or this cell's container if needed.
            // For grid, each well is simply a Well component.
            return (
              <View
                key={`well-${index}`}
                style={[styles.gridWellCell, { width: wellSize, height: wellSize }]}
              >
                <Well
                  wellPlate={plate}
                  style={getWellStyle?.(index)}
                  onClick={onClick} // onClick is (value, e)
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                  text={getWellText}
                  value={index}
                  size={wellSize}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function DefaultWellPlateInternal(
  props: Omit<IWellPlateInternalProps, 'displayAsGrid'>,
) {
  const {
    plate,
    wellSize = 40,
    headerStyle: getHeaderStyle,
    // headerText, // Not used in original DefaultWellPlateInternal text rendering directly
    wellStyle: getWellStyle,
    text: getWellText,
    onClick,
    onMouseDown,
    onMouseUp,
  } = props;

  const rowLabels = plate.rowLabels;
  const columnLabels = plate.columnLabels;

  const renderHeader = (label: string, position: { row: number; column: number }, key: string) => {
    const headerCell: HeaderCell = { label, position };
    // The original DefaultWellPlateInternal did not use props.headerText
    // It directly rendered the label. We keep this behavior.
    // It also applied props.headerStyle.
    const customHeaderStyle = getHeaderStyle?.(headerCell);
    return (
      <View key={key} style={[styles.defaultHeaderCell, {width: wellSize}, customHeaderStyle]}>
        <Text>{label}</Text>
      </View>
    );
  };


  return (
    <View style={styles.defaultContainer}>
      {/* Column Headers */}
      <View style={styles.defaultRow}>
        <View style={[styles.defaultHeaderCell, {width: wellSize}]} /> {/* Empty corner */}
        {columnLabels.map((columnLabel, index) =>
          renderHeader(columnLabel, { column: index, row: -1 }, `col-header-${index}`)
        )}
      </View>

      {/* Rows with Header and Wells */}
      {rowLabels.map((rowLabel, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.defaultRow}>
          {renderHeader(rowLabel, { column: -1, row: rowIdx }, `row-header-${rowIdx}`)}
          {columnLabels.map((_columnLabel, columnIdx) => {
            const index = plate.getPosition(
              { row: rowIdx, column: columnIdx },
              'index',
            );
            return (
              <View key={`well-${index}`} style={[styles.defaultWellWrapper, {width: wellSize, height: wellSize}]}>
                <Well
                  wellPlate={plate}
                  // className removed
                  style={getWellStyle?.(index)}
                  onClick={onClick}
                  // onEnter and onLeave removed
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                  text={getWellText}
                  value={index}
                  size={wellSize}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    // Replaces display: 'grid' and plateDefaultStyles
    // userSelect and WebkitUserSelect are not applicable
    // borderWidth and borderColor from original cellStyle applied to cells
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch', // Ensure cells stretch to fill height if needed
  },
  gridHeaderCell: {
    // Replaces old cellStyle for headers
    borderWidth: 1,
    borderColor: 'gray',
    padding: 5, // From original inline style for header
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridHeaderText: {
    // Add specific text styling for grid headers if needed
  },
  gridWellCell: {
    // This is the container for the <Well /> component in the grid
    // The original grid had padding and alignment on a div that *was* the well
    // Now, <Well/> is the well. If padding is desired *around* the well, it goes here.
    // The original 'cellStyle' (border) is applied to Well directly or its container if distinct.
    // For simplicity, let's ensure the Well component itself handles its own border and appearance.
    // This cell is mainly for layout positioning within the grid.
    justifyContent: 'center',
    alignItems: 'center',
    // borderStyle: 'solid', // Handled by Well
    // borderColor: 'gray', // Handled by Well
    // borderWidth: 1, // Handled by Well
    // No padding here, as wellSize should define the touchable area of the Well component
  },
  defaultContainer: {
    // Replaces boxStyle
    // userSelect and WebkitUserSelect are not applicable
    // paddingBottom: 4, // From original boxStyle, if still desired
    // paddingRight: 4, // From original boxStyle, if still desired
    borderWidth: 1, // From original boxStyle
    borderColor: 'black', // From original boxStyle
    // width is dynamic based on content, no need for fixed width from boxStyle
    alignSelf: 'flex-start', // To mimic the original fixed width behavior
  },
  defaultRow: {
    // Replaces rowStyle
    flexDirection: 'row',
    alignItems: 'center',
    // height is dynamic based on wellSize
  },
  defaultHeaderCell: {
    // Replaces headerStyle in DefaultWellPlateInternal
    // width is passed dynamically
    justifyContent: 'center', // For text centering
    alignItems: 'center',   // For text centering
    // height: wellSize, // Applied by row height or direct styling if needed
  },
  defaultWellWrapper: {
    // Replaces wellStyle in DefaultWellPlateInternal (which was just width/height)
    // width and height are passed dynamically
    // This view wraps the Well component.
  },
});

[end of src/util/WellPlateInternal.tsx]
