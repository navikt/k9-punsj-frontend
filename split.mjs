import { glob } from 'glob';

if (!process.env.CI_TOTAL) {
    // eslint-disable-next-line no-console
    console.error('No envrionment variable CI_TOTAL defined');
    process.exit(1);
}

if (!process.env.CI_INDEX) {
    // eslint-disable-next-line no-console
    console.error('No envrionment variable CI_INDEX defined');
    process.exit(1);
}

function splitChunks(items, total) {
    const chunks = [];

    let currentChunk = 0;
    for (let currentItem = 0; currentItem < items.length; currentItem++) {
        if (!chunks[currentChunk]) {
            chunks[currentChunk] = [];
        }

        chunks[currentChunk].push(items[currentItem]);

        currentChunk++;
        if (currentChunk >= total) {
            currentChunk = 0;
        }
    }

    return chunks;
}

const files = glob.sync('cypress/e2e/**/*.@(js|ts)');
const chunks = splitChunks(files, process.env.CI_TOTAL);

if (chunks[process.env.CI_INDEX]) {
    for (const file of chunks[process.env.CI_INDEX]) {
        process.stdout.write(file + '\n');
    }
}
