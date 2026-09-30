import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const faviconPath = path.resolve(__dirname, '../../app/favicon.png');

// Favicon og HTML blir i poden; kun dist/js går til CDN. nais.js kopieres inn av Dockerfile.
export const podAssets = () => ({
    name: 'k9-punsj:pod-assets',
    apply: 'build',
    generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'favicon.png', source: readFileSync(faviconPath) });
    },
    transformIndexHtml: {
        order: 'post',
        handler(html) {
            // Eksplisitt anonym CORS slik at nettleseren gir full feilinfo for CDN-scripts
            return html.replace(/\scrossorigin(?=[\s>])/g, ' crossorigin="anonymous"');
        },
    },
});
