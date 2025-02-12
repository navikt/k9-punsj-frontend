import glob from 'glob';

function validateNumber(value, name) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
        // eslint-disable-next-line no-console
        console.error(`Invalid ${name}: ${value}. Must be a non-negative number.`);
        process.exit(1);
    }
    return num;
}

if (!process.env.CI_TOTAL) {
    // eslint-disable-next-line no-console
    console.error('No environment variable CI_TOTAL defined');
    process.exit(1);
}

if (!process.env.CI_INDEX) {
    // eslint-disable-next-line no-console
    console.error('No environment variable CI_INDEX defined');
    process.exit(1);
}

const totalChunks = validateNumber(process.env.CI_TOTAL, 'CI_TOTAL');
const index = validateNumber(process.env.CI_INDEX, 'CI_INDEX');

if (index >= totalChunks) {
    // eslint-disable-next-line no-console
    console.error(`CI_INDEX (${index}) must be less than CI_TOTAL (${totalChunks})`);
    process.exit(1);
}

function splitChunks(items, total) {
    if (items.length === 0) {
        return [];
    }

    const chunks = Array.from({ length: total }, () => []);

    items.forEach((item, idx) => {
        const chunkIndex = idx % total;
        chunks[chunkIndex].push(item);
    });

    return chunks;
}

const files = glob.sync('cypress/e2e/**/*.cy.@(js|ts)').sort();

if (files.length === 0) {
    // eslint-disable-next-line no-console
    console.error('No test files found');
    process.exit(1);
}

const chunks = splitChunks(files, totalChunks);

if (chunks[index] && chunks[index].length > 0) {
    process.stdout.write(chunks[index].join(','));
} else {
    // eslint-disable-next-line no-console
    console.error(`No files to process for chunk ${index}`);
    process.exit(1);
}
