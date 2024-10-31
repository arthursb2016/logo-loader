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
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED' && /webcomponents-bundle\.js/.test(warning.loc?.file || '')) {
      return;
    }
    warn(warning); // Let Rollup handle other warnings as usual
  }
};
