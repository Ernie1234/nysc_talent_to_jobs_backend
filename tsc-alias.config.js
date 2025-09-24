// tsc-alias.config.js
export default {
  // Your tsconfig file
  project: 'tsconfig.json',

  // Directories to search for files
  directories: ['dist'],

  // File extensions to process
  extensions: ['js', 'jsx', 'mjs', 'cjs'],

  // Whether to resolve full paths
  resolveFullPaths: true,

  // Verbose output for debugging
  verbose: true,

  // Watch mode (for development)
  watch: false,
};
