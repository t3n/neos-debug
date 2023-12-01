const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
    logLevel: 'info',
    bundle: true,
    minifyIdentifiers: false, // Enabling this would break the embedded CSS of the plugin
    minifyWhitespace: true,
    minifySyntax: true,
    target: 'es2020',
    sourcemap: true,
    entryPoints: { Plugin: 'Resources/Private/Scripts/index.tsx' },
    loader: {
        '.js': 'tsx',
        '.svg': 'text',
    },
    outdir: 'Resources/Public/Scripts',
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch());
} else {
    esbuild.build(options);
}
