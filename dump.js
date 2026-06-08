const fs = require('fs');
const tsconfig = fs.readFileSync('/app/redoc/tsconfig.json', 'utf-8');
const webpack = fs.readFileSync('/app/redoc/webpack.config.ts', 'utf-8');
const tsconfigLib = fs.readFileSync('/app/redoc/tsconfig.lib.json', 'utf-8');
const pkg = fs.readFileSync('/app/redoc/package.json', 'utf-8');

fs.writeFileSync('/app/redoc/dump.json', JSON.stringify({
  tsconfig: tsconfig,
  webpack: webpack,
  tsconfigLib: tsconfigLib,
  pkg: pkg
}));
