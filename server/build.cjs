const esbuild = require('esbuild');

try {
  esbuild.buildSync({
    entryPoints: ['src/app.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: 'dist/app.js',
    external: ['@prisma/client'],
    footer: {
      js: 'module.exports = module.exports.default || module.exports.app || module.exports;',
    },
  });
  console.log('✅ Server successfully bundled into dist/app.js');
} catch (err) {
  console.error('❌ Failed to bundle server:', err);
  process.exit(1);
}
