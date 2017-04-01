const path = require('path');
const jetpack = require('fs-jetpack');
const rollup = require('rollup').rollup;
const utils=require("./utils");

const typescript =require('rollup-plugin-typescript2');
const uglify=require('rollup-plugin-uglify');
const minify=require('uglify-js-harmony').minify;

const nodeBuiltInModules = ['assert', 'buffer', 'child_process', 'cluster',
  'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
  'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
  'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
  'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

const electronBuiltInModules = ['electron'];

const generateExternalModulesList = () => {
  const appManifest = jetpack.read('./src/package.json', 'json');

 // console.log(Object.keys(appManifest.dependencies));
  return [].concat(
    nodeBuiltInModules,
    electronBuiltInModules,
    Object.keys(appManifest.dependencies)
    //Object.keys(appManifest.devDependencies)
  );
};

const cached = {};

module.exports = (src, dest, opts) => {
  const options = opts || {};


  const plugins = [
    // Add rollup plugins here
    typescript(),
  ];

  return rollup({
    entry: src,
    external: generateExternalModulesList(),
    cache: cached[src],
    plugins: plugins.concat(options.rollupPlugins || []).
       concat( utils.isProd()?uglify({  
             compress: {
                    unused: false
             },
             //mangle:false
        }, minify):[]),
  })
  .then((bundle) => {
    cached[src] = bundle;

    const jsFile = path.basename(dest);
    const result = bundle.generate({
      format: 'cjs',
      sourceMap: !utils.isProd(),
      sourceMapFile: jsFile,
    });
    // Wrap code in self invoking function so the constiables don't
    // pollute the global namespace.
    const isolatedCode = `(function () {${result.code}\n}());`;
    return Promise.all([
      jetpack.writeAsync(dest, `${isolatedCode}\n//# sourceMappingURL=${jsFile}.map`),
      !utils.isProd() && jetpack.writeAsync(`${dest}.map`, result.map.toString()),
    ]);
  });
};
