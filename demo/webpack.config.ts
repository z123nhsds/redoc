const CopyWebpackPlugin = require('copy-webpack-plugin');
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
import { execSync } from 'child_process';
import { resolve } from 'path';
import * as webpack from 'webpack';
import { webpackIgnore } from '../config/webpack-utils';

const { version } = require('../package.json') as { version: string };
const VERSION = JSON.stringify(version);
const REVISION = JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim());

function root(filename: string) {
  return resolve(__dirname, filename);
}

class ConcurrentMode {
  apply(compiler: webpack.Compiler) {
    new webpack.DefinePlugin({
      __REACT_CONCURRENT_MODE__: JSON.stringify(true),
    }).apply(compiler);
  }

  getEntry(filename: string) {
    return [root('../src/polyfills.ts'), root(filename)];
  }
}

export default (env: { playground?: boolean; bench?: boolean } = {}) => {
  const concurrentMode = new ConcurrentMode();
  const demoEntry = env.playground
    ? 'playground/hmr-playground.tsx'
    : env.bench
    ? '../benchmark/index.tsx'
    : 'index.tsx';

  return {
    entry: concurrentMode.getEntry(demoEntry),
    target: 'web',
    output: {
      filename: 'redoc-demo.bundle.js',
      path: root('dist'),
      globalObject: 'this',
    },
    devServer: {
      static: __dirname,
      port: 9090,
      hot: true,
      historyApiFallback: true,
      open: true,
    },
    stats: {
      children: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      fallback: {
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer'),
        http: false,
        fs: false,
        os: false,
      },
    },
    performance: false,
    externals: {
      esprima: 'esprima',
      'node-fetch': 'null',
      'node-fetch-h2': 'null',
      yaml: 'null',
      'safe-json-stringify': 'null',
    },
    module: {
      rules: [
        { test: [/\.eot$/, /\.gif$/, /\.woff$/, /\.svg$/, /\.ttf$/], use: 'null-loader' },
        {
          test: /\.(tsx?|[cm]?js)$/,
          loader: 'esbuild-loader',
          options: {
            target: 'es2015',
            tsconfigRaw: require('../tsconfig.json'),
          },
          exclude: [/node_modules/],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'esbuild-loader',
              options: {
                minify: true,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __REDOC_VERSION__: VERSION,
        __REDOC_REVISION__: REVISION,
        'process.env': '{}',
        'process.platform': '"browser"',
        'process.stdout': 'null',
      }),
      concurrentMode,
      new HtmlWebpackPlugin({
        template: env.playground
          ? 'demo/playground/index.html'
          : env.bench
          ? 'benchmark/index.html'
          : 'demo/index.html',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new ForkTsCheckerWebpackPlugin({ logger: { infrastructure: 'silent', issues: 'console' } }),
      webpackIgnore(/js-yaml\/dumper\.js$/),
      webpackIgnore(/json-schema-ref-parser\/lib\/dereference\.js/),
      webpackIgnore(/^\.\/SearchWorker\.worker$/),
      new CopyWebpackPlugin({
        patterns: ['demo/museum.yaml', 'demo/cafe.yaml'],
      }),
    ],
  };
};
