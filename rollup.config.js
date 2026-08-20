import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/logoLoader.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: 'logoLoader.esm.js',
  },
  plugins: [
    resolve(),
    typescript(),
  ],
};
