import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from "@rollup/plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { babel } from '@rollup/plugin-babel';

import pkg from "./package.json" with { type: "json" };

const config = [
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main, // e.g. dist/index.cjs.js
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: "./tsconfig.json",  
        declaration: false,
        declarationDir: undefined,
        emitDeclarationOnly: false 
      }),
      terser(),
      babel({
        presets: ['@babel/react'],
        babelHelpers: 'bundled',
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },

  // ESModule build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module, // e.g. dist/index.esm.js
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: "./tsconfig.json",  
        declaration: false,
        declarationDir: undefined,
        emitDeclarationOnly: false 
      }),
      terser(),
      babel({
        presets: ['@babel/react'],
        babelHelpers: 'bundled',
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
  // TypeScript declaration files
  {
    input: "dist/types/index.d.ts", // where your auto-generated d.ts files are
    output: [{ file: "dist/types/contensis-rag-react.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];

export default config;
