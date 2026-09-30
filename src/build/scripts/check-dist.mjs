import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const distDir = path.join(rootDir, 'dist');
const cdnBase = 'https://cdn.nav.no/k9saksbehandling/k9-punsj-frontend/dist/';
const deployWorkflows = ['build-and-deploy-gcp.yml', 'deploy-preprod-gcp.yml'];

const errors = [];
const check = (condition, message) => {
    if (!condition) {
        errors.push(message);
    }
};

const htmlPath = path.join(distDir, 'index.html');
check(existsSync(htmlPath), 'dist/index.html mangler');
check(existsSync(path.join(distDir, 'favicon.png')), 'dist/favicon.png mangler');

if (existsSync(htmlPath)) {
    const html = readFileSync(htmlPath, 'utf8');
    const tags = html.match(/<(?:script|link)\b[^>]*>/g) ?? [];
    const cdnTags = tags.filter((tag) => tag.includes(cdnBase));

    check(cdnTags.length > 0, 'index.html refererer ikke til noen filer på CDN');
    check(
        cdnTags.some((tag) => tag.startsWith('<script') && tag.includes('type="module"')),
        'index.html mangler modulscript fra CDN',
    );
    check(
        cdnTags.some((tag) => tag.startsWith('<link') && tag.includes('rel="stylesheet"')),
        'index.html mangler uttrukket CSS fra CDN',
    );

    cdnTags.forEach((tag) => {
        check(tag.includes('crossorigin="anonymous"'), `CDN-referanse mangler crossorigin="anonymous": ${tag}`);
        const url = /(?:src|href)="([^"]+)"/.exec(tag)?.[1] ?? '';
        const relativePath = url.slice(cdnBase.length);

        check(/^js\/[^/]+\.[A-Za-z0-9_-]{8,}\.(js|css)$/.test(relativePath), `Uventet CDN-filnavn: ${url}`);
        check(existsSync(path.join(distDir, relativePath)), `Referert CDN-fil finnes ikke i dist: ${url}`);
        if (relativePath.endsWith('.js')) {
            check(existsSync(path.join(distDir, `${relativePath}.map`)), `Sourcemap mangler for ${relativePath}`);
        }
    });

    check(html.includes('/dist/favicon.png'), 'Favicon skal pekes til poden via /dist/favicon.png');
    check(
        /import\((?:\/\*[^*]*\*\/\s*)?'\/dist\/js\/nais\.js'\)/.test(html),
        'nais.js skal lastes fra appens egen origin',
    );
    check(!html.includes(`${cdnBase}js/nais.js`), 'nais.js skal ikke lastes fra CDN');
}

const jsFiles = existsSync(path.join(distDir, 'js')) ? readdirSync(path.join(distDir, 'js')) : [];
check(jsFiles.length > 0, 'dist/js er tom');
check(
    !jsFiles.includes('nais.js'),
    'dist/js/nais.js skal ikke ligge i byggeresultatet (Dockerfile legger den i poden)',
);

deployWorkflows.forEach((workflow) => {
    const content = readFileSync(path.join(rootDir, '.github/workflows', workflow), 'utf8');
    check(
        /source:\s*dist\/js/.test(content) &&
            /destination:\s*\/k9-punsj-frontend\/dist/.test(content) &&
            /source_keep_parent_name:\s*true/.test(content),
        `${workflow} laster ikke opp dist/js til /k9-punsj-frontend/dist`,
    );
});

if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Byggekontroll feilet:\n- ${errors.join('\n- ')}`);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`Byggekontroll OK: ${jsFiles.length} filer i dist/js`);
