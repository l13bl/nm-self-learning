const { resolve } = require("path");

module.exports = {
	stories: [],
	addons: ["@storybook/addon-essentials"],
	staticDirs: [resolve(__dirname, "../apps/site/public")]
	// uncomment the property below if you want to apply some webpack config globally
	// webpackFinal: async (config, { configType }) => {
	//   // Make whatever fine-grained changes you need that should apply to all storybook configs

	//   // Return the altered config
	//   return config;
	// },
};
