const path = require('path');

module.exports = function override(config, env) {

    // If using typescript, uncomment this declare line
    // declare var __webpack_public_path__: any;

    // var scripts = document.getElementsByTagName( "script" );
    // var lastScript = scripts[scripts.length - 1].src;
    // __webpack_public_path__ = lastScript.substr(0, lastScript.lastIndexOf('/') + 1);

  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push('.wasm');

  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [{ loader: require.resolve('wasm-loader'), options: {} }]
  });

  return config;
};