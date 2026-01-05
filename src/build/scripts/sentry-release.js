import { SentryCli } from '@sentry/cli';

async function opprettReleaseTilSentry() {
    const release = process.env.SENTRY_RELEASE;
    const authToken = process.env.SENTRY_AUTH_TOKEN;

    if (!release) {
        throw new Error('"SENTRY_RELEASE" er ikke satt');
    }

    if (!authToken) {
        throw new Error('"SENTRY_AUTH_TOKEN" er ikke satt');
    }

    const cli = new SentryCli();

    try {
        // eslint-disable-next-line no-console
        console.log(`Oppretter Sentry-release ${release}`);
        await cli.releases.new(release);

        // eslint-disable-next-line no-console
        console.log('Laster opp source maps');
        await cli.releases.uploadSourceMaps(release, {
            include: ['dist/js'],
            urlPrefix: '~/dist/js',
            rewrite: false,
        });

        // eslint-disable-next-line no-console
        console.log('Releaser');
        await cli.releases.finalize(release);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Noe gikk galt under source map-opplasting:', e);
    }
}

opprettReleaseTilSentry();
