
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // exclude react-datepicker from source-map-loader
      const rule = webpackConfig.module.rules.find(
        r =>
          r.enforce === 'pre' &&
          Array.isArray(r.use) &&
          r.use.some(u => u.loader?.includes('source-map-loader'))
      );
      if (rule) {
        rule.exclude = [
          ...(Array.isArray(rule.exclude) ? rule.exclude : [rule.exclude].filter(Boolean)),
          /node_modules\/react-datepicker/
        ];
      }

      webpackConfig.ignoreWarnings = webpackConfig.ignoreWarnings || [];
      webpackConfig.ignoreWarnings.push(
        // match the module path
        warning =>
          warning.module &&
          /react-datepicker/.test(warning.module.resource) &&
          /Failed to parse source map/.test(warning.message)
      );

      return webpackConfig;
    },
  },
};
