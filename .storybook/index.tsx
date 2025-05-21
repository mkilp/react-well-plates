import { getStorybookUI } from '@storybook/react-native';
import '../src/doctools'; // Import doctools early
import './preview'; // Ensure preview parameters are loaded

// The import of './main' is typically not needed here as getStorybookUI
// and the bundler usually handle main.ts configuration.
// import './main'; 

const StorybookUIRoot = getStorybookUI({
    // Optional: add v8 specific configurations here
    // Example:
    // initialSelection: { kind: 'WellPlate', name: 'Control' },
    // shouldPersistSelection: true,
});

export default StorybookUIRoot;
