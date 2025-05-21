import type { Preview } from '@storybook/react'; // Or @storybook/react-native if more specific types exist for RN params

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // Add any other global parameters here
  },
  // Add global decorators here if needed
  // decorators: [
  //   (Story) => <View style={{ flex: 1, padding: 10 }}><Story /></View>,
  // ],
};

export default preview;
