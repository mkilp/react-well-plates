// Using a generic type for the config object for simplicity with v8
// as specific StorybookConfig types can sometimes be tied to web frameworks.
const config = {
  stories: ['../stories/**/*.stories.?(ts|tsx|js|jsx|mjs)'],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
  ],
};

export default config;
